import { siteOrigins } from "../../../../site/sites";
import type { APIRoute } from "astro";
import type { SearchEntry } from "@raioviajante/design/search";
import { experiments } from "../data/experiments";

export const GET: APIRoute = () => {
  const entries: SearchEntry[] = experiments.map((item) => ({
    site: "lab",
    title: item.title,
    href: `${siteOrigins.lab}/experiments/${item.slug}/`,
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
