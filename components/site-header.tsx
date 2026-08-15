import Link from 'next/link';
import { Sparkles } from 'lucide-react';

/** Server-rendered header for static content pages (blog, FAQ). */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface-page/85 backdrop-blur">
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5 min-w-0">
          <span
            className="w-8 h-8 shrink-0 rounded-lg bg-gradient-to-br from-brand to-accent flex items-center justify-center shadow-orb border border-brand/30"
            aria-hidden="true"
          >
            <Sparkles className="w-4 h-4 text-white" />
          </span>
          <span className="font-bold tracking-tight text-text-primary truncate">PromptCrafter AI</span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2 text-sm" aria-label="Site">
          <Link
            href="/blog"
            className="px-2.5 py-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
          >
            Blog
          </Link>
          <Link
            href="/faq"
            className="px-2.5 py-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
          >
            FAQ
          </Link>
          <Link
            href="/"
            className="px-3 py-1.5 rounded-lg bg-gradient-to-br from-brand to-accent hover:brightness-110 text-white font-semibold text-xs sm:text-sm shadow-glow transition-all"
          >
            Open the app
          </Link>
        </nav>
      </div>
    </header>
  );
}
