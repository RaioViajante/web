import type { APIRoute } from "astro";
import { searchEntries } from "../../lib/search";

export const GET: APIRoute = () =>
  new Response(JSON.stringify(searchEntries("pt-BR")), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
