import { isNotFoundPath, sitemapResponse } from "../../../../seo/metadata";
import { getSeoPages, origin } from "../lib/seo";
export function GET() {
  return sitemapResponse(
    origin,
    getSeoPages()
      .filter((page) => !isNotFoundPath(page.path))
      .map((page) => page.path),
  );
}
