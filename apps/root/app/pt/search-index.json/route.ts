import type { SearchEntry } from "@raioviajante/design/search";
import { siteOrigins } from "../../../../../site/sites";
import { ptNavigation, ptPageSeo, ptSearchDescriptions } from "../../../lib/pt";
import { routes } from "../../../lib/routes";

export const dynamic = "force-static";

/**
 * Root's Portuguese index: only the pages published in Portuguese, each
 * stating `pt-BR`. Search itself is not indexed. Published before Root
 * participates in Portuguese, so the shared search does not read it yet.
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
  return Response.json(entries, {
    headers: { "Access-Control-Allow-Origin": "*" },
  });
}
