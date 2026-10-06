import type { Metadata } from "next";
import { connection } from "next/server";
import type { ReactNode } from "react";
import localFont from "next/font/local";
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

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Nonces must be generated for each document, never at prerender time.
  await connection();
  return (
    <html lang="en" className={mono.variable}>
      <body>
        {children}
        <Behavior />
      </body>
    </html>
  );
}
