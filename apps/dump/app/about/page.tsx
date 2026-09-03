import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "What this site is and who writes it.",
};

export default function AboutPage() {
  return (
    <>
      <h1>About</h1>
      <p>
        This is a personal publishing site for RaioViajante — notes on computer
        science, projects, devlogs, tooling, and hardware. A memory dump,
        hopefully readable.
      </p>
    </>
  );
}
