import type { IncomingMessage, ServerResponse } from 'node:http';
import { createApiApp } from '../server.ts';

export const config = {
  api: {
    bodyParser: false,
  },
};

const app = createApiApp();

export default function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.url) {
    try {
      const parsed = new URL(req.url, 'http://localhost');
      const rewrittenSubpath = parsed.searchParams.get('__path');
      if (rewrittenSubpath && rewrittenSubpath.startsWith('/api/')) {
        parsed.searchParams.delete('__path');
        const remainingQuery = parsed.searchParams.toString();
        req.url = remainingQuery
          ? `${rewrittenSubpath}?${remainingQuery}`
          : rewrittenSubpath;
      } else if (parsed.pathname === '/api/index') {
        const originalUrl =
          req.headers['x-forwarded-uri'] ?? req.headers['x-matched-path'];
        if (
          typeof originalUrl === 'string' &&
          originalUrl.startsWith('/api/') &&
          !originalUrl.startsWith('/api/index')
        ) {
          req.url = originalUrl;
        }
      }
    } catch {
      // Leave req.url intact if malformed
    }
  }

  return (app as unknown as (req: IncomingMessage, res: ServerResponse) => void)(
    req,
    res
  );
}
