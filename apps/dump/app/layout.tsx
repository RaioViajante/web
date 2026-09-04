import type { Metadata } from "next";
import { IBM_Plex_Mono, Source_Serif_4 } from "next/font/google";
import type { ReactNode } from "react";

import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { ThemeToggle } from "@/components/ThemeToggle";
import { alternatesFor, site } from "@/lib/site";
import { jsonLdScript, websiteJsonLd } from "@/lib/structured-data";

import "./globals.css";

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-source-serif",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-ibm-plex-mono",
  weight: ["400", "500"],
});

const themeScript = `
(function(){
  var theme = "light";
  var stored;
  try {
    stored = localStorage.getItem("dump-theme");
  } catch (error) {}
  if (stored === "light" || stored === "dark") {
    theme = stored;
  } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    theme = "dark";
  }
  document.documentElement.setAttribute("data-theme", theme);
})();`;

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
    <html lang={site.locale} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdScript(websiteJsonLd()) }}
        />
      </head>
      <body className={`${sourceSerif.variable} ${ibmPlexMono.variable}`}>
        <a href="#content" className="skip-link">
          Skip to content
        </a>
        <SiteHeader />
        <main id="content" tabIndex={-1}>
          {children}
        </main>
        <SiteFooter />
        <ThemeToggle />
      </body>
    </html>
  );
}
