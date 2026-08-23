import type { Metadata } from 'next';
import DocsLayout from '@/app/docs/layout';
import Link from 'next/link';
import { getAllDocs } from '@/lib/docs-content';

export const metadata: Metadata = {
  title: 'Documentation',
  description: 'PromptCrafter feature documentation',
};

export default function DocsIndexPage() {
  const docs = getAllDocs();
  return (
    <DocsLayout>
      <div className="prose max-w-none">
        <h1>Documentation</h1>
        <p className="text-text-secondary">
          Reference docs for each studio and cross-cutting features.
        </p>
        <ul className="space-y-3 mt-6">
          {docs.map((doc) => (
            <li key={doc.slug} className="not-prose">
              <Link
                href={`/docs/${doc.slug}`}
                className="text-brand hover:underline font-semibold"
              >
                {doc.title}
              </Link>
              {doc.description && (
                <p className="text-text-secondary text-sm mt-1">{doc.description}</p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </DocsLayout>
  );
}