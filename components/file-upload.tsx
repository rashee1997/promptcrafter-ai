'use client';

import React, { useCallback, useRef, useState } from 'react';
import { FolderOpen, FileCode2, X, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CodeFileAttachment, ProjectContext } from '@/types';
import { processUploadedProject, formatProjectContext, formatBytes, buildFileTree } from '@/lib/file-upload-utils';

interface FileUploadProps {
  /** Current code file attachments. */
  codeFiles: CodeFileAttachment[];
  /** Current project context (set when a folder was uploaded). */
  projectContext?: ProjectContext;
  /** Called when files are added (single file mode). */
  onAddFile: (file: CodeFileAttachment) => void;
  /** Called when a project folder is processed. */
  onSetProject: (ctx: ProjectContext) => void;
  /** Called to clear all file attachments. */
  onClearFiles: () => void;
  /** Called to remove a single file. */
  onRemoveFile: (id: string) => void;
}

/** Extensions that can be uploaded as single code files. */
const TEXT_FILE_EXTENSIONS = new Set([
  'ts', 'tsx', 'js', 'jsx', 'mjs', 'cjs',
  'py', 'rb', 'go', 'rs', 'java', 'kt', 'swift',
  'c', 'cpp', 'h', 'hpp', 'cs',
  'html', 'css', 'scss', 'less', 'sass',
  'json', 'yaml', 'yml', 'toml', 'xml',
  'md', 'txt', 'csv', 'sql',
  'sh', 'bash', 'zsh', 'fish',
  'env', 'gitignore', 'dockerignore',
  'vue', 'svelte', 'astro',
  'prisma', 'graphql', 'gql',
  'tf', 'hcl',
  'makefile', 'cmake',
  'rb', 'rake',
  'php',
]);

const ACCEPTED_FILE_TYPES = Array.from(TEXT_FILE_EXTENSIONS)
  .map((ext) => `.${ext}`)
  .join(',');

export function FileUpload({
  codeFiles,
  projectContext,
  onAddFile,
  onSetProject,
  onClearFiles,
  onRemoveFile,
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showTree, setShowTree] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const hasFiles = codeFiles.length > 0 || !!projectContext;

  // ── Single file upload ──
  const handleSingleFile = useCallback(
    (file: File) => {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      if (!TEXT_FILE_EXTENSIONS.has(ext)) {
        setUploadError(`Unsupported file type: .${ext}`);
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setUploadError('File too large (max 2 MB for single files)');
        return;
      }
      setUploadError(null);
      const reader = new FileReader();
      reader.onload = () => {
        onAddFile({
          id: crypto.randomUUID(),
          path: file.name,
          content: reader.result as string,
          size: file.size,
        });
      };
      reader.readAsText(file);
    },
    [onAddFile],
  );

  // ── Folder upload ──
  const handleFolderFiles = useCallback(
    (fileList: FileList) => {
      setUploadError(null);
      const files: { relativePath: string; text: string; size: number; isDirectory: boolean }[] = [];
      const entries = Array.from(fileList);

      // Extract folder name from the first file's webkitRelativePath
      const firstPath = entries[0]?.webkitRelativePath || '';
      const rootFolder = firstPath.split('/')[0] || 'project';

      for (const file of entries) {
        const relativePath = file.webkitRelativePath;
        if (!relativePath) continue;
        // Remove the root folder from the path
        const pathWithinRoot = relativePath.split('/').slice(1).join('/');
        if (!pathWithinRoot) continue;

        files.push({
          relativePath: pathWithinRoot,
          text: '', // Will read below
          size: file.size,
          isDirectory: file.size === 0 && file.type === '',
        });
      }

      // Read text content for non-directory, non-binary files
      let processed = 0;
      const totalToRead = files.filter((f) => !f.isDirectory).length;

      if (totalToRead === 0) {
        setUploadError('No readable files found in the folder');
        return;
      }

      const readFilePromises = entries
        .filter((file) => {
          const rel = file.webkitRelativePath?.split('/').slice(1).join('/') || '';
          return rel && file.size > 0;
        })
        .map((file) => {
          const rel = file.webkitRelativePath!.split('/').slice(1).join('/');
          return new Promise<void>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
              const entry = files.find((f) => f.relativePath === rel);
              if (entry) entry.text = reader.result as string;
              processed++;
              resolve();
            };
            reader.onerror = () => {
              processed++;
              resolve();
            };
            // Read as text for all files — binary detection happens in processUploadedProject
            reader.readAsText(file);
          });
        });

      Promise.all(readFilePromises).then(() => {
        const ctx = processUploadedProject(files, rootFolder);
        if (ctx.includedCount === 0) {
          setUploadError('All files were excluded by filters. Try a different folder.');
          return;
        }
        onSetProject(ctx);
      });
    },
    [onSetProject],
  );

  // ── Drag handlers ──
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const items = e.dataTransfer.items;
      if (items) {
        // Check if a folder is being dropped
        for (const item of Array.from(items)) {
          if ('webkitGetAsEntry' in item) {
            const entry = (item as DataTransferItem).webkitGetAsEntry();
            if (entry?.isDirectory) {
              setUploadError('Folder drag detected — use the "Upload folder" button instead.');
              return;
            }
          }
        }
      }
      // Single file drops
      const files = e.dataTransfer.files;
      if (files.length === 1) {
        handleSingleFile(files[0]);
      }
    },
    [handleSingleFile],
  );

  if (hasFiles) {
    return (
      <div className="space-y-2">
        {/* Summary header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-text-secondary">
            <FileCode2 className="w-4 h-4 text-brand" />
            {projectContext ? (
              <span>
                {projectContext.includedCount} files from{' '}
                <span className="text-brand">{projectContext.projectName}</span>
              </span>
            ) : (
              <span>{codeFiles.length} file{codeFiles.length === 1 ? '' : 's'} attached</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {projectContext && (
              <button
                type="button"
                onClick={() => setShowTree(!showTree)}
                className="text-[10px] font-medium text-text-muted hover:text-brand px-2 py-1 rounded-md hover:bg-brand/5 transition-colors"
              >
                {showTree ? <ChevronUp className="w-3 h-3 inline mr-0.5" /> : <ChevronDown className="w-3 h-3 inline mr-0.5" />}
                Tree
              </button>
            )}
            <button
              type="button"
              onClick={onClearFiles}
              className="text-[10px] font-medium text-text-muted hover:text-danger px-2 py-1 rounded-md hover:bg-danger/5 transition-colors"
            >
              Clear all
            </button>
          </div>
        </div>

        {/* Project tree (collapsible) */}
        {projectContext && showTree && (
          <div className="p-3 rounded-lg bg-surface-code border border-border text-[11px] font-mono text-text-secondary max-h-48 overflow-y-auto">
            <pre className="whitespace-pre-wrap">{buildFileTree(projectContext.files.map((f) => f.path))}</pre>
          </div>
        )}

        {/* Individual file chips (non-project mode) */}
        {!projectContext && codeFiles.map((file) => (
          <div
            key={file.id}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-surface-muted border border-border text-[11px]"
          >
            <FileCode2 className="w-3.5 h-3.5 text-brand shrink-0" />
            <span className="font-mono text-text-primary truncate flex-1">{file.path}</span>
            <span className="text-text-muted shrink-0">{formatBytes(file.size)}</span>
            <button
              type="button"
              onClick={() => onRemoveFile(file.id)}
              className="shrink-0 p-0.5 rounded text-text-muted hover:text-danger transition-colors"
              aria-label={`Remove ${file.path}`}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}

        {/* Omitted summary */}
        {projectContext?.omittedSummary && (
          <div className="flex items-start gap-2 px-2.5 py-2 rounded-lg bg-warning/5 border border-warning/20 text-[10px] text-warning">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>
              {projectContext.omittedSummary.count} more files matched but were left out to keep this within a usable context size — largest omitted:{' '}
              <code className="font-mono font-semibold">{projectContext.omittedSummary.largestOmitted.path}</code>{' '}
              ({formatBytes(projectContext.omittedSummary.largestOmitted.size)}).
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Upload zone */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        className={cn(
          'w-full flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed text-xs font-medium transition-all cursor-pointer',
          isDragging
            ? 'border-brand bg-brand/5 text-brand'
            : 'border-border text-text-muted hover:border-brand/40 hover:text-brand hover:bg-brand/5',
        )}
      >
        <FileCode2 className="w-4 h-4" />
        Upload code file (drag or click)
      </button>

      {/* Folder upload */}
      <button
        type="button"
        onClick={() => folderInputRef.current?.click()}
        className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl border border-dashed border-border text-[11px] font-medium text-text-muted hover:border-brand/40 hover:text-brand hover:bg-brand/5 transition-all cursor-pointer"
      >
        <FolderOpen className="w-3.5 h-3.5" />
        Upload project folder (with .gitignore support)
      </button>

      {/* Hidden inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_FILE_TYPES}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleSingleFile(file);
          if (e.target) e.target.value = '';
        }}
        className="hidden"
        aria-label="Upload code file"
      />
      <input
        ref={folderInputRef}
        type="file"
        // @ts-expect-error — webkitdirectory is a non-standard attribute
        webkitdirectory=""
        multiple
        onChange={(e) => {
          if (e.target.files?.length) handleFolderFiles(e.target.files);
          if (e.target) e.target.value = '';
        }}
        className="hidden"
        aria-label="Upload project folder"
      />

      {/* Error */}
      {uploadError && (
        <p className="text-[10px] text-danger px-1" role="alert">
          {uploadError}
        </p>
      )}
    </div>
  );
}
