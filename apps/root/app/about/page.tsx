import type { Metadata } from "next";
import { SectionHeading } from "../../components/SectionHeading";

export const metadata: Metadata = { title: "about" };

export default function About() {
  return (
    <>
      <div className="rv-hero">
        <p className="rv-eyebrow">about</p>
        <h1>Bryan</h1>
        <p className="rv-dek">The person behind RaioViajante.</p>
      </div>
      <section className="rv-section" aria-labelledby="about-heading">
        <SectionHeading id="about-heading" number="01." title="Who I am" />
        <p className="rv-copy">
          I&apos;m Bryan, a software developer who likes building things for the
          web, trying ideas and understanding how software works. Curiosity
          usually takes me from a question to something I can make and learn
          from.
        </p>
      </section>
      <section className="rv-section" aria-labelledby="building-heading">
        <SectionHeading
          id="building-heading"
          number="01.1"
          title="Why I build"
        />
        <p className="rv-copy">
          Programming gives me a way to follow that curiosity: take an idea
          apart, understand a little more, and build a version of it myself. I
          spend most of my time around web development, backend systems and
          developer tools. Java and TypeScript/JavaScript are familiar ground;
          personal projects give me room to explore beyond them.
        </p>
      </section>
      <section className="rv-section" aria-labelledby="raioviajante-heading">
        <SectionHeading
          id="raioviajante-heading"
          number="01.2"
          title="RaioViajante"
        />
        <p className="rv-copy">
          RaioViajante is the place where I bring together projects, writing,
          documentation and things I discover along the way. Some ideas become
          software. Others become notes on{" "}
          <a href="https://dump.raioviajante.com" data-sound="nav">
            Dump
          </a>
          , documentation on{" "}
          <a href="https://docs.raioviajante.com" data-sound="nav">
            Docs
          </a>{" "}
          or experiments in{" "}
          <a href="https://lab.raioviajante.com" data-sound="nav">
            Lab
          </a>
          .
        </p>
      </section>
      <section className="rv-section" aria-labelledby="outside-heading">
        <SectionHeading
          id="outside-heading"
          number="01.3"
          title="Outside the code"
        />
        <p className="rv-copy">
          I like music and playing guitar, and I make time for films, books and
          games. They are part of my world even when they have nothing to do
          with software.
        </p>
      </section>
    </>
  );
}
