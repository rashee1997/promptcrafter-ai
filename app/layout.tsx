import type { Metadata } from 'next';
import './globals.css'; // Global styles
import { SITE_URL } from '@/lib/site';
import { SITE_DESCRIPTION, SOFTWARE_APPLICATION_LD } from '@/lib/seo';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'PromptCrafter AI',
    template: '%s | PromptCrafter AI',
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: 'PromptCrafter AI',
    title: 'PromptCrafter AI',
    description: SITE_DESCRIPTION,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'PromptCrafter AI — create, test, and improve AI prompts',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PromptCrafter AI',
    description: SITE_DESCRIPTION,
    images: ['/og-image.png'],
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.theme==='dark'||(!('theme'in localStorage)&&matchMedia('(prefers-color-scheme:dark)').matches))document.documentElement.classList.add('dark')}catch(_){}`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(SOFTWARE_APPLICATION_LD).replace(/</g, '\\u003c'),
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-xl focus:bg-surface-card focus:text-text-primary focus:border focus:border-brand text-sm font-semibold shadow-xl"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
