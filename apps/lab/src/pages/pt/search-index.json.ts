import { siteOrigins } from "../../../../../site/sites";
import type { APIRoute } from "astro";
import type { SearchEntry } from "@raioviajante/design/search";
import { portugueseExperiments, experimentPath } from "../../data/experiments";
import { textFor } from "../../lib/copy";

export const GET: APIRoute = () => {
  const entries: SearchEntry[] = portugueseExperiments.map((item) => ({
    site: "lab",
    locale: "pt-BR",
    contentId: item.contentId,
    title: item.title,
    href: `${siteOrigins.lab}${experimentPath(item)}`,
    description: `${item.project} · ${textFor(item.locale).fidelityLabel[item.fidelity]}`,
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
