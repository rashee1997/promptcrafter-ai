import React from 'react';
import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import '@/app/globals.css';

const navItems = [
  { href: '/docs', label: 'Overview' },
  { href: '/docs/text-prompt-studio', label: 'Text Prompt Studio' },
  { href: '/docs/image-logo-studio', label: 'Image & Logo Studio' },
  { href: '/docs/video-prompt-studio', label: 'Video Prompt Studio' },
  { href: '/docs/product-shoot-studio', label: 'Product Shoot Studio' },
  { href: '/docs/measurement-and-quality', label: 'Measurement & Quality' },
  { href: '/docs/providers', label: 'Providers' },
  { href: '/docs/architecture', label: 'Architecture' },
];

export const metadata = {
  title: 'Documentation | PromptCrafter AI',
  description: 'Feature documentation for PromptCrafter AI studios.',
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-surface-page text-text-primary">
      <SiteHeader />
      <div className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col md:flex-row gap-6 md:gap-10">
        <aside className="md:w-56 shrink-0">
          <nav aria-label="Documentation" className="md:sticky md:top-24">
            <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-text-muted">
              Studios
            </p>
            <ul className="space-y-1 mb-4">
              {navItems.slice(1, 5).map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block px-3 py-1.5 rounded-lg text-sm text-text-secondary hover:bg-surface-muted hover:text-text-primary transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-text-muted">
              Cross-Cutting
            </p>
            <ul className="space-y-1">
              {navItems.slice(5).map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block px-3 py-1.5 rounded-lg text-sm text-text-secondary hover:bg-surface-muted hover:text-text-primary transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
        <main className="flex-1 min-w-0 max-w-3xl">
          {children}
        </main>
      </div>
      <SiteFooter />
    </div>
  );
}