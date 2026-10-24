import { headers } from "next/headers";
import Link from "next/link";
import {
  IndexHeader,
  LeaderRow,
  Section,
} from "@raioviajante/design/components";
import { AvatarCoin } from "@raioviajante/design/avatar-coin";
import { jsonLdScript } from "../../../../seo/structured-data";
import { PreviewRow } from "../../components/PreviewRow";
import { ProjectPreviewRow } from "../../components/ProjectPreviewRow";
import { RootShell } from "../../components/RootShell";
import { primaryLinks } from "../../lib/links";
import { ptHome, ptProjects } from "../../lib/pt";
import { webPageJsonLd } from "../../lib/structured-data";
import { metadataFor } from "../../lib/seo";
import { routes } from "../../lib/routes";
import { getLatestWriting } from "../../lib/writing";

export const metadata = metadataFor(routes.home["pt-BR"]!);

export default async function HomePt() {
  const writing = await getLatestWriting("pt-BR");
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <RootShell current={routes.home["pt-BR"]} locale="pt-BR">
      <script
        nonce={nonce}
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript(webPageJsonLd(routes.home["pt-BR"]!, "pt-BR")),
        }}
      />
      <IndexHeader
        name="RaioViajante"
        line={ptHome.line}
        avatar={<AvatarCoin label={ptHome.avatarLabel} />}
      />

      <Section number="00." title={ptHome.links} id="links-heading" index>
        {primaryLinks.map((link) => {
          const copy = ptHome.linkCopy[link.category];
          if (!copy) throw new Error(`No Portuguese copy for ${link.category}`);
          return (
            <PreviewRow
              key={link.href}
              id={`primary-link-${link.category}`}
              label={copy.label ?? link.label}
              href={link.href}
              rel={link.rel}
              note={copy.note}
              description={copy.description}
            />
          );
        })}
      </Section>

      <Section
        number="00.1"
        title={ptHome.projects}
        id="projects-heading"
        index
      >
        {ptProjects
          .filter((project) => project.name !== "Dump")
          .map((project) => (
            <ProjectPreviewRow key={project.name} project={project} />
          ))}
      </Section>

      <Section
        number="00.2"
        title={ptHome.latestWriting}
        id="writing-heading"
        index
      >
        {writing.state === "ready" ? (
          writing.posts.map((post) => (
            <LeaderRow
              linkComponent={Link}
              key={post.url}
              label={post.title}
              value={post.date}
              href={post.url}
            />
          ))
        ) : (
          <>
            <p className="home-feed-note">{ptHome.noWriting}</p>
            <p className="home-feed-note">
              <a
                data-testid="content-link"
                href="https://dump.raioviajante.com"
                hrefLang="en"
                data-sound="nav"
              >
                {ptHome.englishWriting}
              </a>
            </p>
          </>
        )}
      </Section>

      <Section
        number="00.3"
        title={ptHome.otherLinks}
        id="other-links-heading"
        index
      >
        <LeaderRow
          linkComponent={Link}
          label="Setup"
          value={ptHome.setupValue}
          href={routes.setup["pt-BR"]!}
        />
      </Section>
    </RootShell>
  );
}
