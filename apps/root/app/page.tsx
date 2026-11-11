import { headers } from "next/headers";
import {
  jsonLdScript,
  personJsonLd,
  websiteJsonLd,
} from "../../../seo/structured-data";
import { metadataFor, origin, pages } from "../lib/seo";
import Link from "next/link";
import {
  IndexHeader,
  LeaderRow,
  Section,
} from "@raioviajante/design/components";
import { AvatarCoin } from "@raioviajante/design/avatar-coin";
import { PreviewRow } from "../components/PreviewRow";
import { HomeProjects } from "../components/projects/home";
import { RootShell } from "../components/RootShell";
import { primaryLinks } from "../lib/links";
import { getRecentPosts } from "../lib/writing";
import { publishedLocales } from "../lib/routes";

export const metadata = metadataFor("/");

export default async function Home() {
  const posts = await getRecentPosts();
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <RootShell current="/">
      <script
        nonce={nonce}
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript(
            personJsonLd(),
            websiteJsonLd(origin, "raioviajante", pages[0]!.description, {
              author: true,
              languages: publishedLocales(),
            }),
          ),
        }}
      />
      <IndexHeader
        name="RaioViajante"
        line="curious enough to build it myself."
        avatar={<AvatarCoin />}
      />

      <Section number="00." title="Primary links" id="links-heading" index>
        {primaryLinks.map((link) => (
          <PreviewRow
            key={link.href}
            id={`primary-link-${link.category}`}
            label={link.label}
            href={link.href}
            rel={link.rel}
            locale="en"
            note={link.category}
            description={link.description}
          />
        ))}
      </Section>

      <HomeProjects locale="en" />

      <Section number="00.2" title="Latest writing" id="writing-heading" index>
        {posts.map((post) => (
          <LeaderRow
            linkComponent={Link}
            key={post.url}
            label={post.title}
            value={post.date}
            href={post.url}
          />
        ))}
        <p className="home-feed-note">
          <a href="https://dump.raioviajante.com" data-sound="nav">
            from dump.raioviajante.com
          </a>
        </p>
      </Section>

      <Section number="00.3" title="Other links" id="other-links-heading" index>
        <LeaderRow
          linkComponent={Link}
          label="Setup"
          value="gear"
          href="/setup"
        />
      </Section>
    </RootShell>
  );
}
