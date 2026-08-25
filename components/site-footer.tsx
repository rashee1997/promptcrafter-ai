import Link from 'next/link';

/** Server-rendered footer for static content pages (blog, FAQ). */
export function SiteFooter() {
  return (
    <footer className="border-t border-border py-6 px-4 sm:px-6 bg-surface-page">
      <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-2 text-sm text-text-muted">
        <span>© {new Date().getFullYear()} PromptCrafter AI</span>
        <span className="hidden sm:inline">Private &amp; local · No account needed</span>
        <div className="flex items-center gap-4">
          <Link href="/blog" className="hover:text-text-primary transition-colors">
            Blog
          </Link>
          <Link href="/faq" className="hover:text-text-primary transition-colors">
            FAQ
          </Link>
          <Link href="/llms.txt" className="hover:text-text-primary transition-colors">
            llms.txt
          </Link>
        </div>
      </div>
    </footer>
  );
}
