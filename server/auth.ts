import crypto from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

const FIREBASE_CERTS_URL =
  'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';

export interface VerifiedFirebaseUser {
  uid: string;
  email: string;
  emailVerified: boolean;
  name?: string;
  picture?: string;
}

export interface AdminRequest extends Request {
  adminUser?: VerifiedFirebaseUser;
  adminToken?: string;
}

interface CertCache {
  certs: Record<string, string>;
  expiresAtMs: number;
}

let cachedCerts: CertCache | null = null;

function decodeBase64Url(segment: string): Buffer {
  const normalized = segment.replace(/-/g, '+').replace(/_/g, '/');
  const padLength = (4 - (normalized.length % 4)) % 4;
  return Buffer.from(normalized + '='.repeat(padLength), 'base64');
}

export async function fetchFirebasePublicCerts(): Promise<Record<string, string>> {
  const now = Date.now();
  if (cachedCerts && cachedCerts.expiresAtMs > now) {
    return cachedCerts.certs;
  }

  const response = await fetch(FIREBASE_CERTS_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch Firebase public keys (${response.status}).`);
  }

  const certs = (await response.json()) as Record<string, string>;
  const cacheControl = response.headers.get('cache-control') || '';
  const maxAgeMatch = cacheControl.match(/max-age=(\d+)/i);
  const maxAgeSeconds = maxAgeMatch ? Number(maxAgeMatch[1]) : 3600;

  cachedCerts = {
    certs,
    expiresAtMs: now + Math.max(60, maxAgeSeconds) * 1000,
  };
  return certs;
}

export interface VerifyTokenOptions {
  projectId: string;
  getPublicCerts?: () => Promise<Record<string, string>>;
  nowSeconds?: number;
}

export async function verifyFirebaseIdToken(
  token: string,
  options: VerifyTokenOptions
): Promise<VerifiedFirebaseUser> {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Malformed JWT token.');
  }

  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  let header: { alg?: string; kid?: string };
  let payload: {
    aud?: string;
    iss?: string;
    sub?: string;
    exp?: number;
    iat?: number;
    auth_time?: number;
    email?: string;
    email_verified?: boolean;
    name?: string;
    picture?: string;
  };

  try {
    header = JSON.parse(decodeBase64Url(encodedHeader).toString('utf8'));
    payload = JSON.parse(decodeBase64Url(encodedPayload).toString('utf8'));
  } catch {
    throw new Error('Invalid JWT encoding.');
  }

  if (header.alg !== 'RS256' || !header.kid) {
    throw new Error('Unsupported token signature algorithm.');
  }

  const now = options.nowSeconds ?? Math.floor(Date.now() / 1000);
  if (typeof payload.exp !== 'number' || payload.exp <= now) {
    throw new Error('Authentication token has expired.');
  }
  if (typeof payload.iat !== 'number' || payload.iat > now + 300) {
    throw new Error('Token issued-at timestamp is invalid.');
  }
  if (typeof payload.auth_time === 'number' && payload.auth_time > now + 300) {
    throw new Error('Token auth_time timestamp is invalid.');
  }

  const expectedIssuer = `https://securetoken.google.com/${options.projectId}`;
  if (payload.aud !== options.projectId || payload.iss !== expectedIssuer) {
    throw new Error('Token audience or issuer mismatch.');
  }
  if (
    typeof payload.sub !== 'string' ||
    payload.sub.length === 0 ||
    payload.sub.length > 128
  ) {
    throw new Error('Token subject (uid) is invalid.');
  }

  const getCerts = options.getPublicCerts ?? fetchFirebasePublicCerts;
  const certs = await getCerts();
  const publicCert = certs[header.kid];
  if (!publicCert) {
    throw new Error('Matching Firebase signing certificate not found.');
  }

  const verifier = crypto.createVerify('RSA-SHA256');
  verifier.update(`${encodedHeader}.${encodedPayload}`);
  verifier.end();

  const signature = decodeBase64Url(encodedSignature);
  const validSignature = verifier.verify(publicCert, signature);
  if (!validSignature) {
    throw new Error('Invalid token signature.');
  }

  return {
    uid: payload.sub,
    email: typeof payload.email === 'string' ? payload.email : '',
    emailVerified: Boolean(payload.email_verified),
    name: typeof payload.name === 'string' ? payload.name : undefined,
    picture: typeof payload.picture === 'string' ? payload.picture : undefined,
  };
}

export function isAuthorizedAdminEmail(
  email: string | undefined,
  emailVerified: boolean,
  configuredAdminEmail: string
): boolean {
  const cleanAdminEmail = configuredAdminEmail.trim().toLowerCase();
  const cleanUserEmail = (email ?? '').trim().toLowerCase();
  return Boolean(
    emailVerified &&
      cleanAdminEmail &&
      cleanUserEmail &&
      cleanUserEmail === cleanAdminEmail
  );
}

export interface AdminMiddlewareConfig {
  projectId: string;
  adminEmail: string;
  verifyToken?: (token: string, projectId: string) => Promise<VerifiedFirebaseUser>;
}

export function createRequireAdminMiddleware(config: AdminMiddlewareConfig) {
  return async (req: AdminRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: 'Authentication required. Please sign in with the authorized Google account.',
      });
      return;
    }

    const token = authHeader.slice('Bearer '.length).trim();
    if (!token) {
      res.status(401).json({
        error: 'Authentication token is missing.',
      });
      return;
    }

    try {
      const verifier =
        config.verifyToken ??
        ((t: string, projectId: string) =>
          verifyFirebaseIdToken(t, { projectId }));
      const user = await verifier(token, config.projectId);

      if (!isAuthorizedAdminEmail(user.email, user.emailVerified, config.adminEmail)) {
        res.status(403).json({
          error:
            'Access Denied: Only the authorized project owner Google account can perform admin actions.',
        });
        return;
      }

      req.adminUser = user;
      req.adminToken = token;
      next();
    } catch (err) {
      res.status(401).json({
        error:
          err instanceof Error
            ? err.message
            : 'Invalid or expired authentication token.',
      });
    }
  };
}
