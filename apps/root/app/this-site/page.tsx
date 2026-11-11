import { metadataFor } from "../../lib/seo";
import Link from "next/link";
import { PageHeader, Section, SiteLink } from "@raioviajante/design/components";
import { OtherSites } from "../../components/OtherSites";
import { RootShell } from "../../components/RootShell";
import { otherSites } from "../../lib/this-site";

export const metadata = metadataFor("/this-site");

export default function ThisSite() {
  return (
    <RootShell current="/this-site">
      <PageHeader
        label="this site"
        title="raioviajante.com"
        line="A small home for my projects, writing and experiments."
      />
      <Section number="05." title="The site" id="site-heading">
        <p>
          This is the starting point for the RaioViajante sites. It brings my
          projects, recent writing, artwork and contact information into one
          place. The writing lives on Dump, the documentation on Docs, and the
          experiments on Lab. Each has its own site and purpose, and all four
          share one design, one typeface and the same optional sound.
        </p>
      </Section>
      <Section number="05.1" title="How it is built" id="built-heading">
        <ul className="rv-dash-list">
          <li>Next.js, React and TypeScript for the site itself</li>
          <li>CSS for the layout, typography and visual identity</li>
          <li>Original artwork for the character and gallery</li>
          <li>
            Dump&apos;s public RSS feed for the latest writing on the index
          </li>
          <li>Optional sound, with its preference saved in your browser</li>
        </ul>
      </Section>
      <OtherSites sites={otherSites} />
      <Section
        number={`05.${otherSites.length + 2}`}
        title="Repository"
        id="repository-heading"
      >
        <p>
          The code for this site and the other RaioViajante web apps is on{" "}
          <SiteLink
            href="https://github.com/RaioViajante/web"
            data-sound="nav"
            newTab="en"
          >
            GitHub
          </SiteLink>
          . For information about using the site&apos;s text or artwork, see the{" "}
          <Link href="/terms" data-sound="nav">
            Terms of Use
          </Link>
          .
        </p>
      </Section>
    </RootShell>
  );
}
