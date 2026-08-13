/**
 * Canonical site URL.
 *
 * Reads APP_URL (the platform-injected production URL, see .env.example) at
 * build/request time and falls back to localhost for local development.
 * Used for metadataBase, sitemap, robots, and canonical/OG URLs.
 */
function normalizeUrl(value: string | undefined): string {
  if (!value) return 'http://localhost:3000';
  return value.trim().replace(/\/+$/, '');
}

export const SITE_URL = normalizeUrl(process.env.APP_URL);
