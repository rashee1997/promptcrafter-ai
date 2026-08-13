import type { Metadata } from 'next';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

export const metadata: Metadata = {
  title: 'FAQ',
  description:
    'Frequently asked questions about PromptCrafter AI: how it works, where data is stored, which providers are supported, and known limitations.',
};

/**
 * Q&A pairs drawn from the README ("Why PromptCrafter?", "Privacy & Security",
 * "Known Limitations") and the shipped measurement-lab features. Each answer
 * is self-contained — understandable without reading the rest of the page.
 * The FAQPage JSON-LD below mirrors these pairs exactly.
 */
const FAQS: { question: string; answer: string }[] = [
  {
    question: 'How does PromptCrafter AI work?',
    answer:
      'You describe what you want in a short topic line, and PromptCrafter AI generates a structured, role-aware prompt using a prompt framework and tone preset you choose. You can then refine it conversationally — for example "make it more concise" or "add edge-case handling" — and every change is saved as an immutable version you can diff, rename, favorite, or roll back. A test sandbox lets you run any version as a system instruction against a sample query before you use it anywhere.',
  },
  {
    question: 'Do I need an account to use PromptCrafter AI?',
    answer:
      'No. PromptCrafter AI has no accounts and no cloud database. Sessions, versions, and provider settings are stored locally in your browser, so there is nothing to sign up for and no server-side account to manage.',
  },
  {
    question: 'Where is my data stored?',
    answer:
      'Everything lives in your browser. Sessions and prompt versions are stored in IndexedDB, with localStorage and in-memory fallbacks for restricted environments. API keys for custom providers are encrypted on-device with AES-GCM using a key derived from a per-device salt, so keys are not stored in plaintext.',
  },
  {
    question: 'Which AI providers are supported?',
    answer:
      'PromptCrafter AI supports any OpenAI-compatible provider — OpenAI, Groq, OpenRouter, Ollama, or a self-hosted endpoint — plus a built-in Google Gemini integration that reads GEMINI_API_KEY server-side. You configure base URL, model, and API key in the Providers view, and keys are encrypted before being written to local storage.',
  },
  {
    question: 'Does PromptCrafter AI cost money?',
    answer:
      'PromptCrafter AI itself is free and has no subscription or paid tier. You bring your own model API keys: the built-in Gemini integration uses your GEMINI_API_KEY, and custom providers use the keys you configure. Any usage charges come directly from the model provider you choose.',
  },
  {
    question: 'How does the prompt quality scorecard work?',
    answer:
      'Every generated or refined version can be scored 0–100 across six rubric dimensions: clarity and specificity, structure and organization, output specification, contextual guidance, error handling, and token efficiency. Scores come from an LLM-judge prompt or a local heuristic fallback, and each dimension includes a note and a concrete one-line fix suggestion. Scores are stored per version, so you can see how quality changes as you iterate.',
  },
  {
    question: 'Can I test one prompt across different models?',
    answer:
      'Yes. The cross-model A/B lab runs the same prompt and test input through two or more configured providers side by side, then reports a consistency score based on semantic similarity between the answers and a diff view showing where they diverge.',
  },
  {
    question: 'What are the known limitations?',
    answer:
      'Sessions are tied to the browser they were created in — there is no cross-device sync yet. Custom provider API keys are stored client-side (encrypted) and are sent to the provider you configure at request time; they are never transmitted anywhere else.',
  },
];

export default function FaqPage() {
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface-page text-text-primary">
      <SiteHeader />
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Frequently asked questions
        </h1>
        <p className="mt-2 text-sm sm:text-base text-text-secondary">
          Questions about how PromptCrafter AI works, where your data lives, and what it can do.
        </p>
        <div className="mt-8 space-y-6">
          {FAQS.map((faq) => (
            <section
              key={faq.question}
              className="border border-border rounded-xl bg-surface-card p-5 sm:p-6"
            >
              <h2 className="text-base sm:text-lg font-bold leading-snug">{faq.question}</h2>
              <p className="mt-2 text-sm text-text-secondary leading-relaxed">{faq.answer}</p>
            </section>
          ))}
        </div>
      </main>
      <SiteFooter />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqLd).replace(/</g, '\\u003c'),
        }}
      />
    </div>
  );
}
