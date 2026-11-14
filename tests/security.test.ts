import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import test from 'node:test';
import { createApiApp } from '../server.ts';
import { verifyFirebaseIdToken } from '../server/auth.ts';
import {
  evaluateAdminRouteGate,
  isProtectedAdminPath,
} from '../src/utils/adminRouting.ts';

const TEST_PROJECT_ID = 'vibe-zone-test-project';
const OWNER_EMAIL = 'owner@example.com';
const OTHER_EMAIL = 'intruder@example.com';
const TEST_KID = 'test-key-1';

const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});

function toBase64Url(input: string | Buffer): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function signTestFirebaseJwt(overrides: {
  uid?: string;
  email?: string;
  emailVerified?: boolean;
  expOffsetSeconds?: number;
  aud?: string;
  iss?: string;
  tamperSignature?: boolean;
}): string {
  const now = Math.floor(Date.now() / 1000);
  const header = toBase64Url(
    JSON.stringify({ alg: 'RS256', typ: 'JWT', kid: TEST_KID })
  );
  const payload = toBase64Url(
    JSON.stringify({
      aud: overrides.aud ?? TEST_PROJECT_ID,
      iss: overrides.iss ?? `https://securetoken.google.com/${TEST_PROJECT_ID}`,
      sub: overrides.uid ?? 'uid-123',
      iat: now - 30,
      auth_time: now - 30,
      exp: now + (overrides.expOffsetSeconds ?? 3600),
      email: overrides.email ?? OWNER_EMAIL,
      email_verified: overrides.emailVerified ?? true,
    })
  );

  const signer = crypto.createSign('RSA-SHA256');
  signer.update(`${header}.${payload}`);
  signer.end();
  const signature = signer.sign(privateKey);
  if (overrides.tamperSignature) {
    signature[0] = signature[0] ^ 0xff;
  }

  return `${header}.${payload}.${toBase64Url(signature)}`;
}

async function withTestServer(
  run: (
    baseUrl: string,
    stats: {
      commits: number;
      uploads: number;
      deletes: number;
    }
  ) => Promise<void>
) {
  const stats = { commits: 0, uploads: 0, deletes: 0 };

  const app = createApiApp({
    adminEmail: OWNER_EMAIL,
    firebaseConfig: {
      projectId: TEST_PROJECT_ID,
      firestoreDatabaseId: '(default)',
      storageBucket: 'vibe-zone-test.appspot.com',
    },
    verifyToken: (token, projectId) =>
      verifyFirebaseIdToken(token, {
        projectId,
        getPublicCerts: async () => ({ [TEST_KID]: publicKey }),
      }),
    listCollection: async () => [],
    commitWrites: async () => {
      stats.commits += 1;
    },
    uploadMedia: async (_config, _token, objectPath) => {
      stats.uploads += 1;
      return {
        url: `https://storage.example.com/${objectPath}`,
        path: objectPath,
      };
    },
    deleteMedia: async () => {
      stats.deletes += 1;
    },
  });

  const server = http.createServer(app);
  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve());
  });

  const address = server.address();
  assert.ok(address && typeof address === 'object');
  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    await run(baseUrl, stats);
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  }
}

const VALID_SONG_PAYLOAD = {
  title: 'Zinda',
  artist: 'Siddharth Mahadevan',
  album: 'Bhaag Milkha Bhaag',
  language: 'Hindi',
  moodId: 'workout',
  provider: 'youtube',
  providerTrackId: 'Ax0G_P2dBA4',
  artworkUrl: 'https://img.youtube.com/vi/Ax0G_P2dBA4/hqdefault.jpg',
  durationLabel: '3:31',
  durationSeconds: 211,
  isLive: false,
  keywords: ['zinda', 'workout', 'hindi'],
};

test('Scenario 1: Authorized Google owner account logs in and accesses admin endpoints', async () => {
  await withTestServer(async (baseUrl, stats) => {
    const ownerToken = signTestFirebaseJwt({
      uid: 'owner-uid',
      email: OWNER_EMAIL,
      emailVerified: true,
    });

    const sessionRes = await fetch(`${baseUrl}/api/admin/session`, {
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    assert.equal(sessionRes.status, 200);
    const sessionBody = (await sessionRes.json()) as {
      authorized: boolean;
      email: string;
    };
    assert.equal(sessionBody.authorized, true);
    assert.equal(sessionBody.email, OWNER_EMAIL);

    const createRes = await fetch(`${baseUrl}/api/admin/songs`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ownerToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(VALID_SONG_PAYLOAD),
    });
    assert.equal(createRes.status, 201);
    assert.equal(stats.commits, 1);

    const updateRes = await fetch(`${baseUrl}/api/admin/songs/song_123`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${ownerToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(VALID_SONG_PAYLOAD),
    });
    assert.equal(updateRes.status, 200);
    assert.equal(stats.commits, 2);

    const deleteRes = await fetch(`${baseUrl}/api/admin/songs/song_123`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    assert.equal(deleteRes.status, 200);
    assert.equal(stats.commits, 3);
  });
});

test('Scenario 2: Different Google account receives Access Denied (403) and redirects away from /admin', async () => {
  await withTestServer(async (baseUrl, stats) => {
    const otherToken = signTestFirebaseJwt({
      uid: 'other-uid',
      email: OTHER_EMAIL,
      emailVerified: true,
    });

    const sessionRes = await fetch(`${baseUrl}/api/admin/session`, {
      headers: { Authorization: `Bearer ${otherToken}` },
    });
    assert.equal(sessionRes.status, 403);
    const body = (await sessionRes.json()) as { error: string };
    assert.match(body.error, /Access Denied/i);

    const unverifiedOwnerToken = signTestFirebaseJwt({
      uid: 'unverified-uid',
      email: OWNER_EMAIL,
      emailVerified: false,
    });
    const unverifiedRes = await fetch(`${baseUrl}/api/admin/session`, {
      headers: { Authorization: `Bearer ${unverifiedOwnerToken}` },
    });
    assert.equal(unverifiedRes.status, 403);
    assert.equal(stats.commits, 0);
  });

  const decision = evaluateAdminRouteGate('/admin', {
    isAuthenticated: true,
    isAuthorized: false,
  });
  assert.equal(decision.action, 'render-access-denied');
  assert.equal(decision.redirectTo, '/access-denied');
});

test('Scenario 3: Logged-out visitor opening /admin is redirected to /admin/login; normal routes stay public', () => {
  assert.equal(isProtectedAdminPath('/'), false);
  assert.equal(isProtectedAdminPath('/admin'), true);
  assert.equal(isProtectedAdminPath('/admin/songs'), true);
  assert.equal(isProtectedAdminPath('/admin/login'), true);
  assert.equal(isProtectedAdminPath('/access-denied'), true);

  const rootAdminDecision = evaluateAdminRouteGate('/admin', {
    isAuthenticated: false,
    isAuthorized: false,
  });
  assert.equal(rootAdminDecision.action, 'render-login');
  assert.equal(rootAdminDecision.redirectTo, '/admin/login');

  const nestedAdminDecision = evaluateAdminRouteGate('/admin/songs', {
    isAuthenticated: false,
    isAuthorized: false,
  });
  assert.equal(nestedAdminDecision.action, 'render-login');
  assert.equal(nestedAdminDecision.redirectTo, '/admin/login');

  const authorizedLoginDecision = evaluateAdminRouteGate('/admin/login', {
    isAuthenticated: true,
    isAuthorized: true,
  });
  assert.equal(authorizedLoginDecision.action, 'render-panel');
  assert.equal(authorizedLoginDecision.redirectTo, '/admin');
});

test('Scenario 4: Unauthorized direct API access, forged JWTs, expired JWTs, and self-promotion are rejected', async () => {
  await withTestServer(async (baseUrl, stats) => {
    const unauthSession = await fetch(`${baseUrl}/api/admin/session`);
    assert.equal(unauthSession.status, 401);

    const forgedToken = signTestFirebaseJwt({
      email: OWNER_EMAIL,
      emailVerified: true,
      tamperSignature: true,
    });
    const forgedRes = await fetch(`${baseUrl}/api/admin/session`, {
      headers: { Authorization: `Bearer ${forgedToken}` },
    });
    assert.equal(forgedRes.status, 401);

    const expiredToken = signTestFirebaseJwt({
      email: OWNER_EMAIL,
      emailVerified: true,
      expOffsetSeconds: -120,
    });
    const expiredRes = await fetch(`${baseUrl}/api/admin/session`, {
      headers: { Authorization: `Bearer ${expiredToken}` },
    });
    assert.equal(expiredRes.status, 401);

    const registerRes = await fetch(`${baseUrl}/api/admin/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: OTHER_EMAIL }),
    });
    assert.equal(registerRes.status, 403);

    const promoteRes = await fetch(`${baseUrl}/api/admin/promote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'admin' }),
    });
    assert.equal(promoteRes.status, 403);
    assert.equal(stats.commits, 0);
  });
});

test('Scenario 5: Unauthorized users attempting song or storage mutations are rejected without touching Firestore/Storage', async () => {
  await withTestServer(async (baseUrl, stats) => {
    const otherToken = signTestFirebaseJwt({
      uid: 'other-uid',
      email: OTHER_EMAIL,
      emailVerified: true,
    });

    const requests: Array<{
      method: string;
      url: string;
      headers?: Record<string, string>;
      body?: BodyInit;
      expectedStatus: number;
    }> = [
      {
        method: 'POST',
        url: `${baseUrl}/api/admin/songs`,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(VALID_SONG_PAYLOAD),
        expectedStatus: 401,
      },
      {
        method: 'POST',
        url: `${baseUrl}/api/admin/songs`,
        headers: {
          Authorization: `Bearer ${otherToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(VALID_SONG_PAYLOAD),
        expectedStatus: 403,
      },
      {
        method: 'PUT',
        url: `${baseUrl}/api/admin/songs/wk-hi-1`,
        headers: {
          Authorization: `Bearer ${otherToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(VALID_SONG_PAYLOAD),
        expectedStatus: 403,
      },
      {
        method: 'DELETE',
        url: `${baseUrl}/api/admin/songs/wk-hi-1`,
        headers: {
          Authorization: `Bearer ${otherToken}`,
        },
        expectedStatus: 403,
      },
      {
        method: 'POST',
        url: `${baseUrl}/api/admin/catalog/sync`,
        headers: {
          Authorization: `Bearer ${otherToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ songs: [] }),
        expectedStatus: 403,
      },
      {
        method: 'POST',
        url: `${baseUrl}/api/admin/upload`,
        headers: {
          Authorization: `Bearer ${otherToken}`,
          'Content-Type': 'image/png',
          'x-media-folder': 'artwork',
          'x-file-name': 'cover.png',
        },
        body: new Blob([new Uint8Array([1, 2, 3, 4])], { type: 'image/png' }),
        expectedStatus: 403,
      },
      {
        method: 'DELETE',
        url: `${baseUrl}/api/admin/storage`,
        headers: {
          Authorization: `Bearer ${otherToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path: 'artwork/cover.png' }),
        expectedStatus: 403,
      },
    ];

    for (const reqSpec of requests) {
      const res = await fetch(reqSpec.url, {
        method: reqSpec.method,
        headers: reqSpec.headers,
        body: reqSpec.body,
      });
      assert.equal(
        res.status,
        reqSpec.expectedStatus,
        `${reqSpec.method} ${reqSpec.url} expected ${reqSpec.expectedStatus} but got ${res.status}`
      );
    }

    assert.equal(stats.commits, 0);
    assert.equal(stats.uploads, 0);
    assert.equal(stats.deletes, 0);
  });
});

test('Frontend source never contains hardcoded admin email or secret keys', () => {
  const srcDir = path.resolve(process.cwd(), 'src');
  const walk = (dir: string): string[] => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    return entries.flatMap((entry) => {
      const fullPath = path.join(dir, entry.name);
      return entry.isDirectory() ? walk(fullPath) : [fullPath];
    });
  };

  const files = walk(srcDir);
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    assert.equal(
      content.includes('dhurianiket94@gmail.com'),
      false,
      `Frontend file ${file} must not contain admin email`
    );
    assert.equal(
      content.includes('ADMIN_EMAIL'),
      false,
      `Frontend file ${file} must not reference ADMIN_EMAIL`
    );
  }
});
