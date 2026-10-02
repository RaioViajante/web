import type { Metadata } from "next";
import type { ReactNode } from "react";
import { IBM_Plex_Mono, Source_Serif_4 } from "next/font/google";
import { PageContainer } from "../components/PageContainer";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { ThemeToggle } from "../components/ThemeToggle";
import "@raioviajante/design/tokens.css";
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

const themeScript = `
(function(){
  var theme = "light";
  var stored;
  try {
    stored = localStorage.getItem("raioviajante-theme");
  } catch (error) {}
  if (stored === "light" || stored === "dark") {
    theme = stored;
  } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    theme = "dark";
  }
  document.documentElement.setAttribute("data-theme", theme);
})();`;

export const metadata: Metadata = {
  metadataBase: new URL("https://raioviajante.com"),
  title: {
    default: "raioviajante",
    template: "%s · raioviajante",
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
    <html
      lang="en"
      className={`${mono.variable} ${serif.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <SiteHeader />
        <PageContainer as="main" className="site-main">
          {children}
        </PageContainer>
        <SiteFooter />
        <ThemeToggle />
      </body>
    </html>
  );
}
