import type { SearchEntry } from "@raioviajante/design/search";
import { siteOrigins } from "../../../../../site/sites";
import {
  ptNavigation,
  ptPageSeo,
  ptProjects,
  ptSearchDescriptions,
} from "../../../lib/pt";
import { routes } from "../../../lib/routes";

export const dynamic = "force-static";

/**
 * Root's Portuguese index: only the pages published in Portuguese, each
 * stating `pt-BR`. Search itself is not indexed. Root participates in
 * Portuguese, so the shared search reads it.
 */
export function GET() {
  const entries: SearchEntry[] = ptNavigation.map(({ key, label }, index) => ({
    site: "root",
    locale: "pt-BR",
    title: key === "home" ? "início" : (ptPageSeo[key]?.title ?? label),
    href: siteOrigins.root + routes[key]["pt-BR"]!,
    description: ptSearchDescriptions[key] ?? "",
    number: `${String(index).padStart(2, "0")}.`,
  }));
  const projectEntries: SearchEntry[] = ptProjects.map((project, index) => ({
    site: "root",
    locale: "pt-BR",
    title: project.name,
    href: siteOrigins.root + routes.projects["pt-BR"]!,
    description: project.description,
    number: `${String(index + 1).padStart(2, "0")}.`,
  }));
  return Response.json([...entries, ...projectEntries], {
    headers: { "Access-Control-Allow-Origin": "*" },
  });
}
