import { pages, origin } from "../lib/seo";
export default function sitemap() {
  return pages.map(({ path }) => ({ url: new URL(path, origin).href }));
}
