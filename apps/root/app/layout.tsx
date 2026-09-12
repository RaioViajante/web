import type { Metadata } from "next";
import type { ReactNode } from "react";
import { IBM_Plex_Mono, Source_Serif_4 } from "next/font/google";
import { PageContainer } from "../components/PageContainer";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import "./globals.css";

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-mono",
});

const serif = Source_Serif_4({
  subsets: ["latin"],
  weight: "variable",
  axes: ["opsz"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "raioviajante.com",
  description: "The personal internet home of RaioViajante.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${mono.variable} ${serif.variable}`}>
      <body>
        <SiteHeader />
        <PageContainer as="main" className="site-main">
          {children}
        </PageContainer>
        <SiteFooter />
      </body>
    </html>
  );
}
