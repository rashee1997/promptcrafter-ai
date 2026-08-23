import type { Metadata } from 'next';
import DocsLayout from '@/app/docs/layout';
import { getDocBySlug, getAllDocs } from '@/lib/docs-content';
import { MarkdownRenderer } from '@/components/markdown-renderer';

export const metadata: Metadata = {
  title: 'Documentation',
  description: 'PromptCrafter feature documentation',
};

export async function generateStaticParams() {
  const docs = getAllDocs();
  return docs.map((doc) => ({ slug: doc.slug }));
}

export default async function DocPage({ params }: { params: { slug: string } }) {
  const doc = getDocBySlug(params.slug);
  if (!doc) {
    return (
      <DocsLayout>
        <div className="prose">Document not found.</div>
      </DocsLayout>
    );
  }

  return (
    <DocsLayout>
      <div className="prose max-w-none">
        <h1>{doc.title}</h1>
        {doc.description && <p className="text-text-secondary text-base">{doc.description}</p>}
        <MarkdownRenderer content={doc.content} />
      </div>
    </DocsLayout>
  );
}
