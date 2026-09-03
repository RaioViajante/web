import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "What this site is and who writes it.",
};

export default function AboutPage() {
  return (
    <div className="about-page prose">
      <h1 className="about-heading">About</h1>
    </div>
  );
}
