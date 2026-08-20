'use client';

import React, { useState } from 'react';
import { Paperclip, ChevronDown, ChevronUp, Image as ImageIcon } from 'lucide-react';
import { Expandable } from './expandable';
import { FileUpload } from './file-upload';
import { PdfUpload } from './pdf-upload';
import {
  CodeFileAttachment,
  ProjectContext,
  PdfAttachment,
  TextStudioImageAttachment,
  TextStudioImagePurpose,
} from '@/types';
import { cn } from '@/lib/utils';
import { ImagePlus, X } from 'lucide-react';

// ── Image Upload (text-studio variant) ───────────────────────────────────────

const IMAGE_PURPOSE_OPTIONS: { value: TextStudioImagePurpose; label: string; color: string }[] = [
  { value: 'screenshot-to-describe', label: 'Screenshot to describe', color: 'bg-brand/15 border-brand text-brand' },
  { value: 'diagram-mockup-reference', label: 'Diagram / mockup reference', color: 'bg-[#8ab4f8]/15 border-[#8ab4f8] text-[#8ab4f8]' },
  { value: 'example-output-style', label: 'Example output style', color: 'bg-warning/15 border-warning text-warning' },
];

const MAX_IMAGES = 5;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB

interface ImageUploadProps {
  images: TextStudioImageAttachment[];
  onAdd: (img: TextStudioImageAttachment) => void;
  onRemove: (id: string) => void;
  onUpdatePurpose: (id: string, purpose: TextStudioImagePurpose) => void;
}

function TextStudioImageUpload({ images, onAdd, onRemove, onUpdatePurpose }: ImageUploadProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const atCapacity = images.length >= MAX_IMAGES;

  const processFile = React.useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) return;
      if (images.length >= MAX_IMAGES) return;
      if (file.size > MAX_IMAGE_SIZE) return;

      const reader = new FileReader();
      reader.onload = () => {
        onAdd({
          id: crypto.randomUUID(),
          dataUrl: reader.result as string,
          name: file.name,
          purpose: 'screenshot-to-describe',
          size: file.size,
        });
      };
      reader.readAsDataURL(file);
    },
    [images.length, onAdd],
  );

  const handleFiles = React.useCallback(
    (files: FileList | null) => {
      if (!files) return;
      const remaining = MAX_IMAGES - images.length;
      Array.from(files).slice(0, remaining).forEach(processFile);
    },
    [images.length, processFile],
  );

  return (
    <div className="space-y-2">
      {/* Upload zone */}
      <button
        type="button"
        onClick={() => !atCapacity && fileInputRef.current?.click()}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files); }}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        disabled={atCapacity}
        className={cn(
          'w-full flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed text-xs font-medium transition-all',
          atCapacity
            ? 'border-border/50 text-text-muted cursor-not-allowed opacity-50'
            : isDragging
              ? 'border-brand bg-brand/5 text-brand'
              : 'border-border text-text-muted hover:border-brand/40 hover:text-brand hover:bg-brand/5 cursor-pointer',
        )}
      >
        <ImagePlus className="w-4 h-4" />
        {atCapacity
          ? `Max ${MAX_IMAGES} images`
          : images.length === 0
            ? 'Add images (drag or click)'
            : `Add another (${images.length}/${MAX_IMAGES})`}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => { handleFiles(e.target.files); if (e.target) e.target.value = ''; }}
        className="hidden"
        aria-label="Upload images"
      />

      {/* Uploaded images */}
      {images.map((img) => (
        <div key={img.id} className="flex items-start gap-2.5 p-2 rounded-lg bg-surface-muted/60 border border-border">
          <div className="shrink-0 w-12 h-12 rounded-md overflow-hidden border border-border/60 bg-surface-card">
            <img src={img.dataUrl} alt="Reference" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0 space-y-1.5">
            <p className="text-[10px] text-text-muted truncate">{img.name}</p>
            <div className="flex flex-wrap gap-1">
              {IMAGE_PURPOSE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onUpdatePurpose(img.id, opt.value)}
                  className={cn(
                    'px-1.5 py-0.5 rounded text-[9px] font-semibold border transition-all',
                    img.purpose === opt.value
                      ? opt.color
                      : 'border-border text-text-muted hover:text-text-secondary',
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={() => onRemove(img.id)}
            className="shrink-0 p-1 rounded text-text-muted hover:text-danger transition-colors"
            title="Remove image"
            aria-label="Remove image"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

// ── Main Panel ───────────────────────────────────────────────────────────────

export interface ContextAttachmentPanelProps {
  /** Current code file attachments. */
  codeFiles: CodeFileAttachment[];
  /** Current project context. */
  projectContext?: ProjectContext;
  /** Called when files are added (single file mode). */
  onAddFile: (file: CodeFileAttachment) => void;
  /** Called when a project folder is processed. */
  onSetProject: (ctx: ProjectContext) => void;
  /** Called to clear all file attachments. */
  onClearFiles: () => void;
  /** Called to remove a single file. */
  onRemoveFile: (id: string) => void;
  /** Current PDF attachments. */
  pdfs: PdfAttachment[];
  /** Called when a PDF is added. */
  onAddPdf: (pdf: PdfAttachment) => void;
  /** Called to remove a PDF. */
  onRemovePdf: (id: string) => void;
  /** Current image attachments. */
  images: TextStudioImageAttachment[];
  /** Called when an image is added. */
  onAddImage: (img: TextStudioImageAttachment) => void;
  /** Called to remove an image. */
  onRemoveImage: (id: string) => void;
  /** Called to update an image's purpose tag. */
  onUpdateImagePurpose: (id: string, purpose: TextStudioImagePurpose) => void;
}

export function ContextAttachmentPanel({
  codeFiles,
  projectContext,
  onAddFile,
  onSetProject,
  onClearFiles,
  onRemoveFile,
  pdfs,
  onAddPdf,
  onRemovePdf,
  images,
  onAddImage,
  onRemoveImage,
  onUpdateImagePurpose,
}: ContextAttachmentPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  const totalAttachments =
    (projectContext ? projectContext.includedCount : codeFiles.length) +
    pdfs.length +
    images.length;

  return (
    <div className="border-t border-border pt-4">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls="attachments-panel"
        className="w-full flex items-center justify-between gap-2 text-left group"
      >
        <div className="flex items-center gap-2 text-xs font-semibold text-text-secondary group-hover:text-brand transition-colors">
          <Paperclip className="w-4 h-4 text-brand" />
          <span>Context &amp; attachments</span>
          {totalAttachments > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-brand/15 text-brand text-[10px] font-bold">
              {totalAttachments}
            </span>
          )}
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      <Expandable open={isOpen} id="attachments-panel" className="mt-4 space-y-5">
        {/* Code Files / Project */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-success" />
            Code files &amp; project
          </label>
          <p className="text-[10px] text-text-muted leading-relaxed">
            Upload source code files or an entire project folder. Files are read locally — nothing is sent to a server until you generate.
          </p>
          <FileUpload
            codeFiles={codeFiles}
            projectContext={projectContext}
            onAddFile={onAddFile}
            onSetProject={onSetProject}
            onClearFiles={onClearFiles}
            onRemoveFile={onRemoveFile}
          />
        </div>

        {/* PDF */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8ab4f8]" />
            PDF documents
          </label>
          <p className="text-[10px] text-text-muted leading-relaxed">
            Attach PDFs to use as context — specs, research papers, or reference documents. Gemini reads PDFs natively; other models get an auto-extracted text summary.
          </p>
          <PdfUpload pdfs={pdfs} onAdd={onAddPdf} onRemove={onRemovePdf} />
        </div>

        {/* Images */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-warning" />
            Images
          </label>
          <p className="text-[10px] text-text-muted leading-relaxed">
            Attach screenshots, diagrams, or mockups. Each image gets a purpose tag that guides how the AI uses it.
          </p>
          <TextStudioImageUpload
            images={images}
            onAdd={onAddImage}
            onRemove={onRemoveImage}
            onUpdatePurpose={onUpdateImagePurpose}
          />
        </div>
      </Expandable>
    </div>
  );
}
