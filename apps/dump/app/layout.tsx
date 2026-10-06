import type { Metadata } from "next";
import localFont from "next/font/local";
import type { ReactNode } from "react";

import { alternatesFor, site } from "@/lib/site";
import { jsonLdScript, websiteJsonLd } from "@/lib/structured-data";
import { Behavior } from "@raioviajante/design/behavior-react";

import "@raioviajante/design/styles.css";
import "./globals.css";

const mono = localFont({
  src: "../../../packages/design/fonts/NotoSansMono-Latin-Variable.woff2",
  weight: "100 900",
  display: "optional",
  variable: "--font-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  authors: [{ name: site.author }],
  // No canonical here: child pages that need one set it themselves, and an
  // inherited `canonical: "/"` would wrongly point every page at the
  // homepage. Every page's `alternates` (this one included) goes through
  // `alternatesFor` so the RSS link survives that per-page override.
  alternates: alternatesFor(),
  // Site-level Open Graph defaults. No `url` here — like `canonical`, an
  // inherited one would point every page at the homepage. Post pages set their
  // own `openGraph`.
  openGraph: {
    type: "website",
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    locale: "en_US",
  },
  // A generated OG image now exists on every page (site default, or a
  // per-post one) — large-image is the correct card type for that.
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang={site.locale} className={mono.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdScript(websiteJsonLd()) }}
        />
      </head>
      <body>
        {children}
        <Behavior />
      </body>
    </html>
  );
}
