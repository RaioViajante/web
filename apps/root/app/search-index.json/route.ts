import { siteOrigins } from "../../../../site/sites";
import type { SearchEntry } from "@raioviajante/design/search";
import { projects } from "../../lib/projects";

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
  ].map(([title, href, description], index) => ({
    site: "root",
    title,
    href: base + href,
    description,
    number: `${String(index).padStart(2, "0")}.`,
  }));
  const projectEntries: SearchEntry[] = projects.map((project, index) => ({
    site: "root",
    title: project.name,
    href: base + "/projects",
    description: project.description,
    number: `${String(index + 1).padStart(2, "0")}.`,
  }));
  return Response.json([...pages, ...projectEntries], {
    headers: { "Access-Control-Allow-Origin": "*" },
  });
}
