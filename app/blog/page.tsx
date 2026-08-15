import Link from 'next/link';
import type { Metadata } from 'next';
import { getAllPosts } from '@/lib/content';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Notes on prompt engineering, evaluation, and the PromptCrafter AI workbench: how the measurement loop works, comparisons, and release notes.',
};

export default function BlogIndexPage() {
  const posts = getAllPosts();

  return (
    <div className="min-h-screen flex flex-col bg-surface-page text-text-primary">
      <SiteHeader />
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Blog</h1>
        <p className="mt-2 text-sm sm:text-base text-text-secondary">
          Notes on prompt engineering, evaluation, and how we build PromptCrafter AI.
        </p>
        <div className="mt-8 space-y-6">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="border border-border rounded-xl bg-surface-card p-5 sm:p-6"
            >
              <time
                dateTime={post.date}
                className="text-[11px] font-semibold uppercase tracking-wider text-text-muted"
              >
                {post.date}
              </time>
              <h2 className="mt-2 text-lg font-bold leading-snug">
                <Link href={`/blog/${post.slug}`} className="hover:text-brand transition-colors">
                  {post.title}
                </Link>
              </h2>
              <p className="mt-2 text-sm text-text-secondary leading-relaxed">{post.description}</p>
            </article>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
