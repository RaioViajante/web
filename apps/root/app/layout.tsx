import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { connection } from "next/server";
import type { ReactNode } from "react";
import { DEFAULT_LOCALE, LOCALES, isLocaleId } from "../../../site/locales";
import { siteOrigins } from "../../../site/sites";
import localFont from "next/font/local";
import { Behavior } from "@raioviajante/design/behavior-react";
import { themeColor } from "@raioviajante/design/theme-color";
import "@raioviajante/design/styles.css";
import "./globals.css";

const mono = localFont({
  src: "../../../packages/design/fonts/NotoSansMono-Latin-Variable.woff2",
  weight: "100 900",
  display: "optional",
  adjustFontFallback: false,
  fallback: [
    "ui-monospace",
    "SFMono-Regular",
    "Menlo",
    "Consolas",
    "monospace",
  ],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigins.root),
  title: {
    default: "raioviajante",
    template: "%s — raioviajante",
  },
  description: "curious enough to build it myself.",
  openGraph: {
    title: "RaioViajante",
    description: "curious enough to build it myself.",
    url: siteOrigins.root,
    siteName: "RaioViajante",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "RaioViajante",
    description: "curious enough to build it myself.",
  },
};

export async function generateViewport(): Promise<Viewport> {
  return { themeColor: await themeColor() };
}

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Nonces must be generated for each document, never at prerender time.
  await connection();
  // The proxy derives the locale from the URL; nothing else decides it.
  const stated = (await headers()).get("x-locale");
  const locale = isLocaleId(stated) ? stated : DEFAULT_LOCALE;
  return (
    <html lang={LOCALES[locale].htmlLang} className={mono.variable}>
      <body>
        {children}
        <Behavior />
      </body>
    </html>
  );
}
