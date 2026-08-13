import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';
import { getAllPosts } from '@/lib/content';

export default function sitemap(): MetadataRoute.Sitemap {
  // Static content pages. Post dates come from the post frontmatter; the
  // root lastModified is a static date until there is real deployment data.
  const posts: MetadataRoute.Sitemap = getAllPosts().map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: post.dateModified,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [
    {
      url: SITE_URL,
      lastModified: new Date('2026-08-13'),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date('2026-08-13'),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/faq`,
      lastModified: new Date('2026-08-13'),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    ...posts,
  ];
}
