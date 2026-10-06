import type { Metadata } from "next";
import { PageHeader, Section } from "@raioviajante/design/components";
import { RootShell } from "../../components/RootShell";

export const metadata: Metadata = { title: "about" };

export default function About() {
  return (
    <RootShell current="/about">
      <PageHeader
        label="about"
        title="Bryan"
        line="The person behind RaioViajante."
      />
      <Section number="01." title="Who I am" id="about-heading">
        <p>
          I&apos;m Bryan, a software developer who likes building things for the
          web, trying ideas and understanding how software works. Curiosity
          usually takes me from a question to something I can make and learn
          from.
        </p>
      </Section>
      <Section number="01.1" title="Why I build" id="building-heading">
        <p>
          Programming gives me a way to follow that curiosity: take an idea
          apart, understand a little more, and build a version of it myself. I
          spend most of my time around web development, backend systems and
          developer tools. Java and TypeScript/JavaScript are familiar ground;
          personal projects give me room to explore beyond them.
        </p>
      </Section>
      <Section number="01.2" title="RaioViajante" id="raioviajante-heading">
        <p>
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
      </Section>
      <Section number="01.3" title="Outside the code" id="outside-heading">
        <p>
          I like music and playing guitar, and I make time for films, books and
          games. They are part of my world even when they have nothing to do
          with software.
        </p>
      </Section>
    </RootShell>
  );
}
