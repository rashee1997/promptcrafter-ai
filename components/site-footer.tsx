import Link from 'next/link';

/** Server-rendered footer for static content pages (blog, FAQ). */
export function SiteFooter() {
  return (
    <footer className="border-t border-border py-6 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-text-muted">
        <span>© {new Date().getFullYear()} PROMPTCRAFTER AI</span>
        <div className="flex items-center gap-4">
          <Link href="/blog" className="hover:text-text-primary transition-colors">
            BLOG
          </Link>
          <Link href="/faq" className="hover:text-text-primary transition-colors">
            FAQ
          </Link>
          <Link href="/llms.txt" className="hover:text-text-primary transition-colors">
            LLMS.TXT
          </Link>
        </div>
      </div>
    </footer>
  );
}
