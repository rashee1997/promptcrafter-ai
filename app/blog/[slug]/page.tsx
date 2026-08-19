import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getAllPosts, getPostBySlug } from '@/lib/content';
import { SITE_URL } from '@/lib/site';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { ReadingProgress } from '@/components/reading-progress';

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  const url = `${SITE_URL}/blog/${post.slug}`;
  return {
    title: post.title,
    description: post.description,
    openGraph: {
      type: 'article',
      url,
      title: post.title,
      description: post.description,
      publishedTime: post.date,
      modifiedTime: post.dateModified,
      authors: ['PromptCrafter AI'],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    },
  };
}

export default async function BlogPostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.dateModified,
    author: { '@type': 'Organization', name: 'PromptCrafter AI' },
    publisher: { '@type': 'Organization', name: 'PromptCrafter AI' },
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface-page text-text-primary">
      <ReadingProgress />
      <SiteHeader />
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <article>
          <header>
            <Link
              href="/blog"
              className="text-xs font-semibold text-text-muted hover:text-text-primary transition-colors"
            >
              ← Back to blog
            </Link>
            <h1 className="mt-3 text-2xl sm:text-4xl font-bold tracking-tight leading-tight">
              {post.title}
            </h1>
            <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
              <time dateTime={post.date}>{post.date}</time>
              {post.tags.length > 0 && ` · ${post.tags.join(' · ')}`}
            </p>
          </header>
          <div className="mt-8 prose prose-sm sm:prose-base max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
          </div>
        </article>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(articleLd).replace(/</g, '\\u003c'),
          }}
        />
      </main>
      <SiteFooter />
    </div>
  );
}
