import { DEFAULT_LOCALE } from "../../../../site/locales";
import { siteOrigins } from "../../../../site/sites";
import type { APIRoute } from "astro";
import type { SearchEntry } from "@raioviajante/design/search";
import { experiments } from "../data/experiments";
import { experimentPath } from "../data/experiments";

export const GET: APIRoute = () => {
  const entries: SearchEntry[] = experiments.map((item) => ({
    site: "lab",
    locale: DEFAULT_LOCALE,
    contentId: item.contentId,
    title: item.title,
    href: `${siteOrigins.lab}${experimentPath(item)}`,
    description: `${item.project} · ${item.fidelity}`,
    body: `${item.description} ${item.what} ${item.notes ?? ""}`,
    number: item.id,
  }));
  return new Response(JSON.stringify(entries), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
};
