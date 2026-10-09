import { siteOrigins, type SiteId } from "../site/sites.ts";

// A small curated discovery index, not a crawler policy or a content mirror.
const link = (site: SiteId, path: string, label: string, description: string) =>
  `- [${label}](${new URL(path, siteOrigins[site]).href}): ${description}`;

const indexes: Record<
  SiteId,
  { title: string; description: string; links: string[] }
> = {
  root: {
    title: "RaioViajante",
    description:
      "The personal internet home of RaioViajante: identity, current projects, artwork and things built out of curiosity.",
    links: [
      link("root", "/about", "About", "Identity and interests."),
      link(
        "root",
        "/projects",
        "Projects",
        "Current software projects and experiments.",
      ),
      link(
        "root",
        "/gallery",
        "Gallery",
        "Character artwork and illustrations.",
      ),
      link("root", "/this-site", "This site", "How the sites fit together."),
      link("root", "/contact", "Contact", "Public contact information."),
      link(
        "dump",
        "/",
        "Dump",
        "Writing, posts and the story behind the work.",
      ),
      link("docs", "/", "Docs", "Stable technical documentation."),
      link(
        "lab",
        "/",
        "Lab",
        "Interactive experiments and technical curiosities.",
      ),
    ],
  },
  dump: {
    title: "Dump",
    description:
      "Writing by RaioViajante: computer science notes, project stories, devlogs and technology posts.",
    links: [
      link("dump", "/", "Latest writing", "Recent posts."),
      link("dump", "/archive", "Archive", "Published posts by date."),
      link("dump", "/tags", "Tags", "Browse writing by topic."),
      link("dump", "/rss.xml", "RSS", "Feed of published posts."),
    ],
  },
  docs: {
    title: "Docs",
    description:
      "Stable, curated technical documentation for projects and systems built under RaioViajante.",
    links: [
      link(
        "docs",
        "/",
        "Documentation index",
        "Public project guides and RaioViajante standards.",
      ),
      link("docs", "/projects/sweep/", "Sweep", "File organizer guide."),
      link("docs", "/projects/sweep/cli/", "Sweep CLI", "Command reference."),
      link(
        "docs",
        "/raioviajante/design-language/",
        "Design language",
        "Shared visual and interaction conventions.",
      ),
      link(
        "docs",
        "/raioviajante/repository-conventions/",
        "Repository conventions",
        "Project organization and development conventions.",
      ),
    ],
  },
  lab: {
    title: "Lab",
    description:
      "Interactive experiments and technical curiosities by RaioViajante. Each experiment states whether it runs here, is simulated or presents source only.",
    links: [
      link(
        "lab",
        "/",
        "Experiment index",
        "Public experiments, status and fidelity.",
      ),
    ],
  },
};

export function renderLlmsTxt(site: SiteId) {
  const { title, description, links } = indexes[site];
  return `# ${title}\n\n> ${description}\n\n## Public resources\n\n${links.join("\n")}\n`;
}

export function llmsResponse(site: SiteId) {
  return new Response(renderLlmsTxt(site), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
