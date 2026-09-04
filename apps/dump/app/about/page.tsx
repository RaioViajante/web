import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "What this site is and who writes it.",
};

export default function AboutPage() {
  return (
    <div className="about-page prose">
      <h1 className="about-heading">About</h1>
      <p>I&rsquo;m RaioViajante.</p>
      <p>
        An alter ego with an unreasonable amount of curiosity about computers.
      </p>
      <p>
        I like understanding what happens underneath the abstractions &mdash;
        operating systems, software, hardware, tools, and whatever else makes me
        open a terminal at 2 a.m.
      </p>
      <p>
        I&rsquo;m not here to pretend I know everything. This is mostly me
        learning in public: building things, breaking them, fixing some of them,
        and writing down what I learned before I forget.
      </p>
      <p className="about-coda">This is where I leave the evidence.</p>
    </div>
  );
}
