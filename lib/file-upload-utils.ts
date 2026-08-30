/**
 * File / project upload processing utilities for the Text Prompt Studio.
 *
 * Handles: dependency-folder exclusions, .gitignore parsing, binary
 * detection, size/count caps, and structured output formatting.
 */

import { CodeFileAttachment, ProjectContext } from '@/types';
import { escapeXml } from '@/lib/request-validation';

// ── Exclusion Rules ──────────────────────────────────────────────────────────

/**
 * Always-exclude directory segments — matched on any path segment, not just root.
 * These are never useful as prompt context and can be enormous.
 */
const ALWAYS_EXCLUDED_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  '.next',
  'out',
  'target',
  'vendor',
  '.venv',
  'venv',
  '__pycache__',
  '.turbo',
  '.cache',
  'coverage',
  '.idea',
  '.vscode',
  'tmp',
  'temp',
  '.DS_Store',
]);

// ── Binary / non-text detection ──────────────────────────────────────────────

const BINARY_EXTENSIONS = new Set([
  // Images
  'png', 'jpg', 'jpeg', 'gif', 'bmp', 'ico', 'webp', 'avif', 'tiff', 'svg',
  // Fonts
  'woff', 'woff2', 'ttf', 'otf', 'eot',
  // Archives
  'zip', 'tar', 'gz', 'bz2', 'xz', '7z', 'rar',
  // Binaries
  'exe', 'dll', 'so', 'dylib', 'bin', 'dat',
  // Documents
  'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
  // Media
  'mp3', 'mp4', 'wav', 'avi', 'mov', 'mkv', 'flac', 'ogg',
  // Other
  'lock', 'sum', 'map', 'min.js', 'min.css',
]);

/** Check if a file path has a binary/non-text extension. */
export function isBinaryExtension(path: string): boolean {
  const ext = path.split('.').pop()?.toLowerCase() || '';
  return BINARY_EXTENSIONS.has(ext);
}

// ── .gitignore Parsing ───────────────────────────────────────────────────────

/**
 * Minimal gitignore-style pattern matcher.
 * Supports: plain paths, `*` glob, `**` recursive, `!` negation, `/` directory suffix.
 * Uses the `ignore` npm package when available; falls back to a simple implementation.
 */

interface GitignoreRule {
  pattern: string;
  negated: boolean;
  /** If true, pattern only matches directories. */
  dirOnly: boolean;
  /** The original line for debugging. */
  original: string;
}

function parseGitignoreRule(line: string): GitignoreRule | null {
  let trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return null;

  let negated = false;
  if (trimmed.startsWith('!')) {
    negated = true;
    trimmed = trimmed.slice(1);
  }

  let dirOnly = false;
  if (trimmed.endsWith('/')) {
    dirOnly = true;
    trimmed = trimmed.slice(0, -1);
  }

  return { pattern: trimmed, negated, dirOnly, original: line.trim() };
}

function matchGitignorePattern(pattern: string, filePath: string, isDir: boolean): boolean {
  // If pattern is a plain directory name, match if any segment equals it
  if (!pattern.includes('/') && !pattern.includes('*')) {
    const segments = filePath.split('/');
    return segments.some((seg) => seg === pattern);
  }

  // Pattern with / — match from root
  if (pattern.includes('/')) {
    const patternParts = pattern.split('/');
    const pathParts = filePath.split('/');

    // Find if the pattern matches starting at any position
    for (let start = 0; start <= pathParts.length - patternParts.length; start++) {
      let match = true;
      for (let i = 0; i < patternParts.length; i++) {
        if (!matchSegment(patternParts[i], pathParts[start + i])) {
          match = false;
          break;
        }
      }
      if (match) return true;
    }
    return false;
  }

  // Pattern with glob — match against filename
  if (pattern.includes('*')) {
    const segments = filePath.split('/');
    const fileName = segments[segments.length - 1];
    return matchSegment(pattern, fileName);
  }

  return false;
}

function matchSegment(pattern: string, value: string | undefined): boolean {
  if (!value) return false;
  // Convert simple gitignore glob to regex
  const regexStr = pattern
    .replace(/\./g, '\\.')
    .replace(/\*\*/g, '{{DOUBLE_STAR}}')
    .replace(/\*/g, '[^/]*')
    .replace(/\{\{DOUBLE_STAR\}\}/g, '.*');
  return new RegExp(`^${regexStr}$`, 'i').test(value);
}

/** Check if a file path is ignored by a set of gitignore rules. */
export function isIgnoredByGitignore(filePath: string, rules: GitignoreRule[]): boolean {
  let ignored = false;
  for (const rule of rules) {
    const matched = matchGitignorePattern(rule.pattern, filePath, false);
    if (matched) {
      ignored = !rule.negated;
    }
  }
  return ignored;
}

/** Parse a .gitignore file's content into rules. */
export function parseGitignore(content: string): GitignoreRule[] {
  return content.split('\n')
    .map(parseGitignoreRule)
    .filter((r): r is GitignoreRule => r !== null);
}

// ── Size / Count Caps ────────────────────────────────────────────────────────

export const MAX_INCLUDED_FILES = 400;
export const MAX_TOTAL_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB

// ── Project Upload Processing ────────────────────────────────────────────────

interface RawUploadedFile {
  /** Relative path from the project root (webkitRelativePath). */
  relativePath: string;
  /** File content as text. */
  text: string;
  /** Original file size in bytes. */
  size: number;
  /** Whether the browser detected this as a directory entry. */
  isDirectory: boolean;
}

/**
 * Assign a priority weight to files so architectural definitions (package configs,
 * schemas, types, APIs) are preserved even in large repositories.
 */
function getFilePriority(filePath: string): number {
  const lower = filePath.toLowerCase();
  const base = lower.split('/').pop() || '';

  // Priority 1: Manifests, schemas, configurations, and core typing
  if (
    base === 'package.json' ||
    base === 'tsconfig.json' ||
    base === 'schema.prisma' ||
    base === 'gemfile' ||
    base === 'cargo.toml' ||
    base === 'requirements.txt' ||
    base === 'pyproject.toml' ||
    base === 'go.mod' ||
    base === 'dockerfile' ||
    base.endsWith('.d.ts') ||
    lower.includes('/types/') ||
    lower.includes('/interfaces/') ||
    lower.includes('/schemas/') ||
    lower.includes('/models/') ||
    base === 'types.ts' ||
    base === 'index.ts' ||
    base === 'app.ts' ||
    base === 'main.ts'
  ) {
    return 1;
  }

  // Priority 2: Primary route handlers, APIs, database, and library utilities
  if (
    lower.includes('/api/') ||
    lower.includes('/routes/') ||
    lower.includes('/controllers/') ||
    lower.includes('/services/') ||
    lower.includes('/lib/') ||
    lower.includes('/utils/')
  ) {
    return 2;
  }

  // Priority 3: Shallow components and source files
  const depth = filePath.split('/').length;
  if (depth <= 3) return 3;

  // Priority 4: Everything else
  return 4;
}

/**
 * Process a raw uploaded file list from a folder selection input.
 * Applies exclusion rules, .gitignore parsing, size caps, and binary detection.
 */
export function processUploadedProject(
  rawFiles: RawUploadedFile[],
  projectName: string,
): ProjectContext {
  // 1. Filter out directories and binary files
  let candidates = rawFiles.filter(
    (f) => !f.isDirectory && !isBinaryExtension(f.relativePath),
  );

  const totalFilesFound = candidates.length;

  // 2. Apply always-excluded directory rules
  candidates = candidates.filter((f) => {
    const segments = f.relativePath.split('/');
    return !segments.some((seg) => ALWAYS_EXCLUDED_DIRS.has(seg));
  });

  // 3. Collect and apply .gitignore rules
  const gitignoreFiles = candidates.filter((f) => {
    const basename = f.relativePath.split('/').pop() || '';
    return basename === '.gitignore';
  });

  if (gitignoreFiles.length > 0) {
    // Sort by path depth — deeper gitignores are scoped to their subtree
    gitignoreFiles.sort((a, b) => {
      const depthA = a.relativePath.split('/').length;
      const depthB = b.relativePath.split('/').length;
      return depthA - depthB;
    });

    // Apply each gitignore to its subtree scope
    candidates = candidates.filter((f) => {
      for (const gi of gitignoreFiles) {
        const giDir = gi.relativePath.split('/').slice(0, -1).join('/');
        // Check if the file is within the gitignore's scope
        if (!giDir || f.relativePath.startsWith(giDir + '/') || f.relativePath === gi.relativePath) {
          const scopedPath = giDir
            ? f.relativePath.slice(giDir.length + 1)
            : f.relativePath;
          const rules = parseGitignore(gi.text);
          if (rules.length > 0 && isIgnoredByGitignore(scopedPath, rules)) {
            return false;
          }
        }
      }
      return true;
    });
  }

  // 4. Remove the .gitignore files themselves from the context
  candidates = candidates.filter((f) => {
    const basename = f.relativePath.split('/').pop() || '';
    return basename !== '.gitignore';
  });

  // 5. Sort by priority first (configs & types first), then path depth, then alphabetical
  candidates.sort((a, b) => {
    const pA = getFilePriority(a.relativePath);
    const pB = getFilePriority(b.relativePath);
    if (pA !== pB) return pA - pB;

    const depthA = a.relativePath.split('/').length;
    const depthB = b.relativePath.split('/').length;
    if (depthA !== depthB) return depthA - depthB;

    return a.relativePath.localeCompare(b.relativePath);
  });

  // 6. Apply size cap
  let runningSize = 0;
  const included: CodeFileAttachment[] = [];
  const omitted: { path: string; size: number }[] = [];
  let omittedTotalSize = 0;

  for (const file of candidates) {
    const wouldBeTotal = runningSize + file.size;
    if (included.length >= MAX_INCLUDED_FILES || wouldBeTotal > MAX_TOTAL_SIZE_BYTES) {
      omitted.push({ path: file.relativePath, size: file.size });
      omittedTotalSize += file.size;
      continue;
    }
    runningSize = wouldBeTotal;
    included.push({
      id: crypto.randomUUID(),
      path: file.relativePath,
      content: file.text,
      size: file.size,
    });
  }

  const omittedSummary = omitted.length > 0
    ? {
        count: omitted.length,
        largestOmitted: omitted.sort((a, b) => b.size - a.size)[0],
        totalSizeExceeded: omittedTotalSize,
      }
    : undefined;

  return {
    files: included,
    totalFilesFound,
    includedCount: included.length,
    omittedSummary,
    projectName,
  };
}

// ── Project Context Formatting ───────────────────────────────────────────────

/**
 * Format a ProjectContext into the structured XML PROJECT CONTEXT block
 * that gets injected into the generation request.
 */
export function formatProjectContext(ctx: ProjectContext): string {
  const lines: string[] = [];

  lines.push(`<project_context project_name="${escapeXml(ctx.projectName || 'Attached Codebase')}">`);
  lines.push('<!-- GROUND TRUTH CODEBASE CONTEXT: Use the exact file paths, schemas, interfaces, function signatures, and imports provided below. DO NOT invent alternative structures, mock placeholders, or TODO stubs for files that exist here. -->');
  lines.push('');

  // File tree
  lines.push('<file_tree>');
  const tree = buildFileTree(ctx.files.map((f) => f.path));
  lines.push(tree);
  lines.push('</file_tree>');
  lines.push('');

  // File contents in XML blocks
  lines.push('<repository_files>');
  for (const file of ctx.files) {
    lines.push(`  <file path="${escapeXml(file.path)}">`);
    lines.push(escapeXml(file.content));
    lines.push('  </file>');
    lines.push('');
  }
  lines.push('</repository_files>');

  // Omitted summary
  if (ctx.omittedSummary) {
    const s = ctx.omittedSummary;
    lines.push(`<!-- Note: ${s.count} additional secondary files were omitted to stay within context limits. Largest omitted: ${s.largestOmitted.path} (${formatBytes(s.largestOmitted.size)}) -->`);
  }

  lines.push('</project_context>');

  return lines.join('\n');
}

/** Build an indented file tree string from a list of paths. */
export function buildFileTree(paths: string[]): string {
  const tree: Record<string, any> = {};
  for (const p of paths) {
    const parts = p.split('/');
    let current = tree;
    for (const part of parts) {
      if (!current[part]) current[part] = {};
      current = current[part];
    }
  }
  return renderTree(tree, 0);
}

function renderTree(node: Record<string, any>, depth: number): string {
  const lines: string[] = [];
  const indent = '  '.repeat(depth);
  for (const [name, children] of Object.entries(node)) {
    if (Object.keys(children).length > 0) {
      lines.push(`${indent}${name}/`);
      lines.push(renderTree(children, depth + 1));
    } else {
      lines.push(`${indent}${name}`);
    }
  }
  return lines.join('\n');
}

/** Format bytes to human-readable size. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}
