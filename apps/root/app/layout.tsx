import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Noto_Sans_Mono } from "next/font/google";
import { Behavior } from "@raioviajante/design/behavior-react";
import "@raioviajante/design/styles.css";
import "./globals.css";

const mono = Noto_Sans_Mono({
  subsets: ["latin"],
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
      <body>
        {children}
        <Behavior />
      </body>
    </html>
  );
}
