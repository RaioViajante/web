import { DEFAULT_LOCALE } from "../../../../site/locales";
import { searchEntries } from "@/lib/search-index";

export const dynamic = "force-static";

export function GET() {
  const entries = searchEntries(DEFAULT_LOCALE);
  return Response.json(entries, {
    headers: { "Access-Control-Allow-Origin": "*" },
  });
}
