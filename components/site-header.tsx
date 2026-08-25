import Link from 'next/link';
import { Sparkles } from 'lucide-react';

/** Server-rendered header for static content pages (blog, FAQ). */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface-page">
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5 min-w-0">
          <span
            className="w-8 h-8 shrink-0 rounded bg-brand flex items-center justify-center"
            aria-hidden="true"
          >
            <Sparkles className="w-4 h-4 text-[var(--brand-foreground)]" />
          </span>
          <span className="font-semibold tracking-tight text-text-primary truncate">PromptCrafter AI</span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2 text-sm font-medium" aria-label="Site">
          <Link
            href="/blog"
            className="px-2.5 py-1.5 rounded text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
          >
            Blog
          </Link>
          <Link
            href="/faq"
            className="px-2.5 py-1.5 rounded text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
          >
            FAQ
          </Link>
          <Link
            href="/"
            className="px-3 py-1.5 rounded bg-brand hover:bg-brand-hover text-[var(--brand-foreground)] transition-colors"
          >
            Open the app
          </Link>
        </nav>
      </div>
    </header>
  );
}
