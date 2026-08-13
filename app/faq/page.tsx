import type { Metadata } from 'next';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

export const metadata: Metadata = {
  title: 'FAQ',
  description:
    'Frequently asked questions about PromptCrafter AI: how it works, where your data is stored, which AI services it supports, and known limitations.',
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
      'You describe what you want in a few words, and PromptCrafter AI writes a complete prompt using the structure and tone you choose. You can then refine it in plain language — for example, "make it more concise" — and every change is saved as a new version you can compare, rename, or go back to. A test area lets you run any version against a sample question to see how it responds before you use it.',
  },
  {
    question: 'Do I need an account to use PromptCrafter AI?',
    answer:
      'No. PromptCrafter AI has no accounts and no cloud database. Sessions, versions, and provider settings are stored locally in your browser, so there is nothing to sign up for and no server-side account to manage.',
  },
  {
    question: 'Where is my data stored?',
    answer:
      'Everything lives in your browser. Your prompts and settings are saved locally on your device, and API keys for your own AI services are encrypted before they are stored.',
  },
  {
    question: 'Which AI services are supported?',
    answer:
      'PromptCrafter AI works with any major AI service — Google Gemini (built in), OpenAI, Groq, OpenRouter, or your own private server. You connect the service in Settings, and your API keys are encrypted before they are stored.',
  },
  {
    question: 'Does PromptCrafter AI cost money?',
    answer:
      'PromptCrafter AI itself is free and has no subscription or paid tier. You bring your own model API keys: the built-in Gemini integration uses your GEMINI_API_KEY, and custom providers use the keys you configure. Any usage charges come directly from the model provider you choose.',
  },
  {
    question: 'How does the prompt quality score work?',
    answer:
      'Every version can be scored 0–100 across six areas: clarity, structure, output format, context, safeguards, and conciseness. Each area comes with a note and a suggestion for improvement, and scores are saved per version so you can see how quality changes as you refine.',
  },
  {
    question: 'Can I test one prompt across different models?',
    answer:
      'Yes. The compare view runs the same prompt and test input through two or more AI services side by side, then shows how consistent the answers are and where they differ.',
  },
  {
    question: 'What are the known limitations?',
    answer:
      'Sessions stay in the browser where they were created — there is no cross-device sync yet. Your API keys are stored encrypted on your device and are only sent to the AI service you connected.',
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
