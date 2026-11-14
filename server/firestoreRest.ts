export interface FirebaseClientConfig {
  projectId: string;
  firestoreDatabaseId: string;
  storageBucket: string;
}

type FirestoreValue =
  | { stringValue: string }
  | { integerValue: string }
  | { booleanValue: boolean }
  | { nullValue: null }
  | { arrayValue: { values?: FirestoreValue[] } }
  | { mapValue: { fields: Record<string, FirestoreValue> } };

function toFirestoreValue(val: unknown): FirestoreValue {
  if (val === null || val === undefined) {
    return { nullValue: null };
  }
  if (typeof val === 'boolean') {
    return { booleanValue: val };
  }
  if (typeof val === 'number') {
    return { integerValue: String(Math.round(val)) };
  }
  if (typeof val === 'string') {
    return { stringValue: val };
  }
  if (Array.isArray(val)) {
    return {
      arrayValue: {
        values: val.map((item) => toFirestoreValue(item)),
      },
    };
  }
  if (typeof val === 'object') {
    const fields: Record<string, FirestoreValue> = {};
    Object.entries(val as Record<string, unknown>).forEach(([k, v]) => {
      if (v !== undefined) {
        fields[k] = toFirestoreValue(v);
      }
    });
    return { mapValue: { fields } };
  }
  return { stringValue: String(val) };
}

function toFirestoreFields(
  obj: Record<string, unknown>
): Record<string, FirestoreValue> {
  const fields: Record<string, FirestoreValue> = {};
  Object.entries(obj).forEach(([key, value]) => {
    if (value !== undefined) {
      fields[key] = toFirestoreValue(value);
    }
  });
  return fields;
}

export function fromFirestoreValue(val: unknown): unknown {
  if (!val || typeof val !== 'object') return undefined;
  const v = val as Record<string, unknown>;
  if ('stringValue' in v) return String(v.stringValue);
  if ('integerValue' in v) return Number(v.integerValue);
  if ('doubleValue' in v) return Number(v.doubleValue);
  if ('booleanValue' in v) return Boolean(v.booleanValue);
  if ('nullValue' in v) return null;
  if ('timestampValue' in v) return String(v.timestampValue);
  if ('arrayValue' in v) {
    const arr = v.arrayValue as { values?: unknown[] } | undefined;
    return (arr?.values ?? []).map(fromFirestoreValue);
  }
  if ('mapValue' in v) {
    const map = v.mapValue as { fields?: Record<string, unknown> } | undefined;
    const result: Record<string, unknown> = {};
    Object.entries(map?.fields ?? {}).forEach(([k, fv]) => {
      result[k] = fromFirestoreValue(fv);
    });
    return result;
  }
  return undefined;
}

function docPath(
  config: FirebaseClientConfig,
  collectionName: string,
  docId: string
): string {
  return `projects/${config.projectId}/databases/${config.firestoreDatabaseId}/documents/${collectionName}/${docId}`;
}

function commitEndpoint(config: FirebaseClientConfig): string {
  return `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${config.firestoreDatabaseId}/documents:commit`;
}

export async function listFirestoreCollection(
  config: FirebaseClientConfig,
  collectionName: string,
  idToken?: string
): Promise<Array<{ id: string; data: Record<string, unknown> }>> {
  const results: Array<{ id: string; data: Record<string, unknown> }> = [];
  let pageToken = '';

  do {
    const url = new URL(
      `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${config.firestoreDatabaseId}/documents/${collectionName}`
    );
    url.searchParams.set('pageSize', '200');
    if (pageToken) {
      url.searchParams.set('pageToken', pageToken);
    }

    const headers: Record<string, string> = {};
    if (idToken) {
      headers.Authorization = `Bearer ${idToken}`;
    }

    const res = await fetch(url.toString(), { headers });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Firestore list failed (${res.status}): ${errText}`);
    }

    const json = (await res.json()) as {
      documents?: Array<{ name: string; fields?: Record<string, unknown> }>;
      nextPageToken?: string;
    };

    for (const doc of json.documents ?? []) {
      const id = doc.name.split('/').pop() ?? '';
      const data: Record<string, unknown> = {};
      Object.entries(doc.fields ?? {}).forEach(([k, fv]) => {
        data[k] = fromFirestoreValue(fv);
      });
      results.push({ id, data });
    }

    pageToken = json.nextPageToken ?? '';
  } while (pageToken);

  return results;
}

export interface FirestoreWriteOp {
  type: 'create' | 'set' | 'update' | 'delete';
  collection: string;
  id: string;
  data?: Record<string, unknown>;
  updateMaskFields?: string[];
  serverTimestampFields?: string[];
}

export async function commitFirestoreWrites(
  config: FirebaseClientConfig,
  idToken: string,
  ops: FirestoreWriteOp[]
): Promise<void> {
  if (ops.length === 0) return;

  const writes = ops.map((op) => {
    const name = docPath(config, op.collection, op.id);
    if (op.type === 'delete') {
      return { delete: name };
    }

    const fields = toFirestoreFields(op.data ?? {});
    const updateTransforms = (op.serverTimestampFields ?? []).map((fieldPath) => ({
      fieldPath,
      setToServerValue: 'REQUEST_TIME',
    }));

    const write: Record<string, unknown> = {
      update: { name, fields },
    };

    if (op.type === 'create') {
      write.currentDocument = { exists: false };
    } else if (op.type === 'update') {
      write.currentDocument = { exists: true };
      if (op.updateMaskFields && op.updateMaskFields.length > 0) {
        write.updateMask = { fieldPaths: op.updateMaskFields };
      }
    }

    if (updateTransforms.length > 0) {
      write.updateTransforms = updateTransforms;
    }

    return write;
  });

  const res = await fetch(commitEndpoint(config), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${idToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ writes }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Firestore commit failed (${res.status}): ${text}`);
  }
}

export async function uploadMediaToFirebaseStorage(
  config: FirebaseClientConfig,
  idToken: string,
  objectPath: string,
  buffer: Buffer,
  contentType: string
): Promise<{ url: string; path: string }> {
  const uploadUrl = `https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(
    config.storageBucket
  )}/o?uploadType=media&name=${encodeURIComponent(objectPath)}`;

  const res = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${idToken}`,
      'Content-Type': contentType,
    },
    body: new Uint8Array(buffer),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Storage upload failed (${res.status}): ${text}`);
  }

  const json = (await res.json()) as {
    name: string;
    downloadTokens?: string;
  };
  const token = (json.downloadTokens ?? '').split(',')[0]?.trim();
  const encodedName = encodeURIComponent(json.name || objectPath);
  const url = token
    ? `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${encodedName}?alt=media&token=${token}`
    : `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${encodedName}?alt=media`;

  return {
    url,
    path: json.name || objectPath,
  };
}

export async function deleteMediaFromFirebaseStorage(
  config: FirebaseClientConfig,
  idToken: string,
  objectPath: string
): Promise<void> {
  const deleteUrl = `https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(
    config.storageBucket
  )}/o/${encodeURIComponent(objectPath)}`;

  const res = await fetch(deleteUrl, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });

  if (!res.ok && res.status !== 404) {
    const text = await res.text();
    throw new Error(`Storage delete failed (${res.status}): ${text}`);
  }
}
