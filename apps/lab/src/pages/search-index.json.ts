import type { APIRoute } from "astro";
import type { SearchEntry } from "@raioviajante/design/search";
import { experiments } from "../data/experiments";

export const GET: APIRoute = () => {
  const entries: SearchEntry[] = experiments.map((item) => ({
    site: "lab",
    title: item.title,
    href: `https://lab.raioviajante.com/experiments/${item.slug}/`,
    description: item.description,
    body: `${item.what} ${item.notes ?? ""}`,
    number: item.id,
  }));
  return new Response(JSON.stringify(entries), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
};
