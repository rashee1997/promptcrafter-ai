'use client';

import React, { useCallback, useRef, useState } from 'react';
import { FileText, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PdfAttachment } from '@/types';
import { formatBytes } from '@/lib/file-upload-utils';

const MAX_PDF_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_PDFS = 3;

interface PdfUploadProps {
  pdfs: PdfAttachment[];
  onAdd: (pdf: PdfAttachment) => void;
  onRemove: (id: string) => void;
}

export function PdfUpload({ pdfs, onAdd, onRemove }: PdfUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const atCapacity = pdfs.length >= MAX_PDFS;

  const processFile = useCallback(
    (file: File) => {
      if (file.type !== 'application/pdf') {
        setUploadError('Only PDF files are supported');
        return;
      }
      if (file.size > MAX_PDF_SIZE) {
        setUploadError(`PDF too large (max ${formatBytes(MAX_PDF_SIZE)})`);
        return;
      }
      if (pdfs.length >= MAX_PDFS) {
        setUploadError(`Maximum ${MAX_PDFS} PDFs`);
        return;
      }
      setUploadError(null);

      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        // Strip the data:application/pdf;base64, prefix
        const base64Data = dataUrl.split(',')[1] || '';
        onAdd({
          id: crypto.randomUUID(),
          name: file.name,
          base64Data,
          mimeType: 'application/pdf',
          size: file.size,
        });
      };
      reader.readAsDataURL(file);
    },
    [pdfs.length, onAdd],
  );

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      const remaining = MAX_PDFS - pdfs.length;
      const toProcess = Array.from(files).filter((f) => f.type === 'application/pdf').slice(0, remaining);
      toProcess.forEach(processFile);
    },
    [pdfs.length, processFile],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  return (
    <div className="space-y-2">
      {/* Upload zone */}
      <button
        type="button"
        onClick={() => !atCapacity && fileInputRef.current?.click()}
        onDrop={handleDrop}
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
        <FileText className="w-4 h-4" />
        {atCapacity
          ? `Max ${MAX_PDFS} PDFs`
          : pdfs.length === 0
            ? 'Upload PDF (drag or click)'
            : `Add another PDF (${pdfs.length}/${MAX_PDFS})`}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        multiple
        onChange={(e) => {
          handleFiles(e.target.files);
          if (e.target) e.target.value = '';
        }}
        className="hidden"
        aria-label="Upload PDF files"
      />

      {/* Uploaded PDFs */}
      {pdfs.map((pdf) => (
        <div
          key={pdf.id}
          className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-surface-muted border border-border text-[11px]"
        >
          <FileText className="w-4 h-4 text-brand shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-text-primary truncate">{pdf.name}</p>
            <p className="text-text-muted text-[10px]">{formatBytes(pdf.size)}</p>
          </div>
          <button
            type="button"
            onClick={() => onRemove(pdf.id)}
            className="shrink-0 p-1 rounded text-text-muted hover:text-danger transition-colors"
            title={`Remove ${pdf.name}`}
            aria-label={`Remove ${pdf.name}`}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}

      {uploadError && (
        <p className="text-[10px] text-danger px-1" role="alert">{uploadError}</p>
      )}
    </div>
  );
}
