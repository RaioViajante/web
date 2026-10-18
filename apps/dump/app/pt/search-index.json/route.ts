import { searchEntries } from "@/lib/search-index";

export const dynamic = "force-static";

export function GET() {
  return Response.json(searchEntries("pt-BR"), {
    headers: { "Access-Control-Allow-Origin": "*" },
  });
}
