import Link from 'next/link';

/** Server-rendered header for static content pages (blog, FAQ). */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface-page/85 backdrop-blur">
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5 min-w-0">
          <span className="w-2.5 h-2.5 rounded-full bg-brand shrink-0" aria-hidden="true" />
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
            className="px-3 py-1.5 rounded-lg bg-brand text-white font-semibold text-xs sm:text-sm hover:opacity-90 transition-opacity"
          >
            Open the app
          </Link>
        </nav>
      </div>
    </header>
  );
}
