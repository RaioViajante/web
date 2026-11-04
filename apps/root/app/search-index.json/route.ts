import { DEFAULT_LOCALE } from "../../../../site/locales";
import { siteOrigins } from "../../../../site/sites";
import type { SearchEntry } from "@raioviajante/design/search";
import { projects, projectsCopy } from "../../lib/projects";
import { routes } from "../../lib/routes";

export const dynamic = "force-static";

export function GET() {
  const base = siteOrigins.root;
  const pages: SearchEntry[] = [
    ["index", "/", "Personal home and latest writing"],
    ["about", "/about", "About RaioViajante"],
    ["projects", "/projects", "Projects and work"],
    ["contact", "/contact", "Ways to get in touch"],
    ["gallery", "/gallery", "Artwork and images"],
    ["this site", "/this-site", "How this site is built"],
    ["setup", "/setup", "Tools and setup"],
    // Last, so the numbers above keep matching the sidebar.
    ["all projects", "/projects/all", "Every project, by kind"],
  ].map(([title, href, description], index) => ({
    site: "root",
    locale: DEFAULT_LOCALE,
    title,
    href: base + href,
    description,
    number: `${String(index).padStart(2, "0")}.`,
  }));
  // Each project points at its own card: the four on /projects, the rest in
  // the catalog.
  const projectEntries: SearchEntry[] = projects.map((project, index) => ({
    site: "root",
    locale: DEFAULT_LOCALE,
    title: project.name,
    href: `${base}${routes[project.featured ? "projects" : "projects-all"].en}#${project.id}`,
    description: projectsCopy.projects[project.id].description,
    number: `${String(index + 1).padStart(2, "0")}.`,
  }));
  return Response.json([...pages, ...projectEntries], {
    headers: { "Access-Control-Allow-Origin": "*" },
  });
}
