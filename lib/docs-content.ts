import fs from 'node:fs';
import path from 'node:path';

/**
 * Build-time content layer for documentation pages.
 *
 * Markdown files live in docs/*.md with a minimal frontmatter block
 * (title, description). Parsed with the same tiny parser as blog posts.
 */
export interface DocPage {
  slug: string;
  title: string;
  description: string;
  content: string; // Markdown body, frontmatter stripped
}

const DOCS_DIR = path.join(process.cwd(), 'docs');

interface Frontmatter {
  title?: string;
  description?: string;
}

/** Minimal YAML-ish frontmatter parser: `key: value` lines between --- fences. */
function parseFrontmatter(raw: string): { data: Frontmatter; body: string } {
  const data: Frontmatter = {};
  if (!raw.startsWith('---\n')) return { data, body: raw };

  const end = raw.indexOf('\n---\n', 4);
  if (end === -1) return { data, body: raw };

  const header = raw.slice(4, end);
  const body = raw.slice(end + 5);
  for (const line of header.split('\n')) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line
      .slice(idx + 1)
      .trim()
      .replace(/^["']|["']$/g, '');
    if (!key) continue;
    (data as Record<string, string>)[key] = value;
  }
  return { data, body: body.replace(/^\n/, '') };
}

function loadDoc(slug: string, filePath: string): DocPage | null {
  const raw = fs.readFileSync(filePath, 'utf8');
  const { data, body } = parseFrontmatter(raw);
  if (!data.title) return null;

  return {
    slug,
    title: data.title,
    description: data.description || '',
    content: body,
  };
}

export function getAllDocs(): DocPage[] {
  if (!fs.existsSync(DOCS_DIR)) return [];
  const docs: DocPage[] = [];
  for (const entry of fs.readdirSync(DOCS_DIR)) {
    if (!entry.endsWith('.md')) continue;
    const slug = entry.slice(0, -3);
    const doc = loadDoc(slug, path.join(DOCS_DIR, entry));
    if (doc) docs.push(doc);
  }
  // Preserve the order we want in the sidebar
  const order = [
    'text-prompt-studio',
    'image-logo-studio',
    'video-prompt-studio',
    'product-shoot-studio',
    'measurement-and-quality',
    'providers',
    'architecture',
  ];
  return docs.sort((a, b) => order.indexOf(a.slug) - order.indexOf(b.slug));
}

export function getDocBySlug(slug: string): DocPage | undefined {
  const filePath = path.join(DOCS_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return undefined;
  return loadDoc(slug, filePath) || undefined;
}