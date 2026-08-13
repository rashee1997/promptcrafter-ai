import fs from 'node:fs';
import path from 'node:path';

/**
 * Build-time content layer for static pages (blog posts, FAQ).
 *
 * Markdown files live in content/blog/*.md with a minimal frontmatter block
 * (title, description, date, dateModified, tags). Parsed with a tiny
 * key:value parser — no gray-matter dependency needed. Markdown rendering
 * reuses react-markdown + remark-gfm (already used by the app's output pane)
 * in server components, so no client bundle weight is added.
 */

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string; // ISO date (YYYY-MM-DD)
  dateModified: string;
  tags: string[];
  content: string; // Markdown body, frontmatter stripped
}

const CONTENT_DIR = path.join(process.cwd(), 'content', 'blog');

interface Frontmatter {
  title?: string;
  description?: string;
  date?: string;
  dateModified?: string;
  tags?: string;
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

function loadPost(slug: string, filePath: string): BlogPost | null {
  const raw = fs.readFileSync(filePath, 'utf8');
  const { data, body } = parseFrontmatter(raw);
  if (!data.title || !data.date) return null;

  return {
    slug,
    title: data.title,
    description: data.description || '',
    date: data.date,
    dateModified: data.dateModified || data.date,
    tags: (data.tags || '')
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean),
    content: body,
  };
}

export function getAllPosts(): BlogPost[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  const posts: BlogPost[] = [];
  for (const entry of fs.readdirSync(CONTENT_DIR)) {
    if (!entry.endsWith('.md')) continue;
    const slug = entry.slice(0, -3);
    const post = loadPost(slug, path.join(CONTENT_DIR, entry));
    if (post) posts.push(post);
  }
  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  const filePath = path.join(CONTENT_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return undefined;
  return loadPost(slug, filePath) || undefined;
}
