import type { Metadata } from "next";
import type { ReactNode } from "react";
import { IBM_Plex_Mono } from "next/font/google";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";
import { SiteNavigation } from "../components/SiteNavigation";
import "@raioviajante/design/editorial.css";
import "./globals.css";

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://raioviajante.com"),
  title: {
    default: "raioviajante",
    template: "%s — raioviajante",
  },
  description: "curious enough to build it myself.",
  openGraph: {
    title: "RaioViajante",
    description: "curious enough to build it myself.",
    url: "https://raioviajante.com",
    siteName: "RaioViajante",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "RaioViajante",
    description: "curious enough to build it myself.",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={mono.variable}>
      <body className="rv-shell">
        <a className="skip-link" href="#content">
          Skip to content
        </a>
        <SiteHeader />
        <div className="rv-frame rv-layout">
          <SiteNavigation />
          <main id="content" className="rv-content">
            {children}
          </main>
        </div>
        <SiteFooter />
      </body>
    </html>
  );
}
