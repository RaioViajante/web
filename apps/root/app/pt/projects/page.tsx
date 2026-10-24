import { headers } from "next/headers";
import Link from "next/link";
import {
  LeaderRow,
  PageHeader,
  Section,
} from "@raioviajante/design/components";
import { jsonLdScript } from "../../../../../seo/structured-data";
import { RootShell } from "../../../components/RootShell";
import { ptProjects, ptProjectsPage } from "../../../lib/pt";
import { metadataFor } from "../../../lib/seo";
import { routes } from "../../../lib/routes";
import { webPageJsonLd } from "../../../lib/structured-data";

const path = routes.projects["pt-BR"]!;
export const metadata = metadataFor(path);

export default async function ProjectsPt() {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  return (
    <RootShell current={path} locale="pt-BR">
      <script
        nonce={nonce}
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript(webPageJsonLd(path, "pt-BR")),
        }}
      />
      <PageHeader
        label={ptProjectsPage.label}
        title={ptProjectsPage.title}
        line={ptProjectsPage.line}
      />
      <Section
        number="02."
        title={ptProjectsPage.sectionTitle}
        id="all-projects-heading"
      >
        {ptProjects.map((project) => {
          const repository = project.href.startsWith("https://github.com/");
          const address = project.href
            .replace(/^https?:\/\//, "")
            .replace(/\/$/, "");

          return (
            <article className="project-entry" key={project.name}>
              <LeaderRow
                linkComponent={Link}
                label={project.name}
                value={project.status}
                href={project.href}
              />
              <p className="project-description">{project.description}</p>
              <p className="project-detail">
                <strong>{ptProjectsPage.type}</strong>{" "}
                <span>{project.kind}</span>
              </p>
              <p className="project-detail">
                <strong>
                  {repository ? ptProjectsPage.repository : ptProjectsPage.url}
                </strong>{" "}
                <a href={project.href} data-sound="nav">
                  {address}
                </a>
              </p>
            </article>
          );
        })}
      </Section>
    </RootShell>
  );
}
