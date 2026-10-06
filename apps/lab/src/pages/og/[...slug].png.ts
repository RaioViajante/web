import type { APIRoute } from "astro";
import { createSocialImage } from "@raioviajante/design/social-image";
import { socialKey } from "@raioviajante/design/seo";
import { getSeoPages, origin } from "../../lib/seo";
export function getStaticPaths() {
  return getSeoPages().map((page) => ({
    params: { slug: socialKey(page.path).replace(/\.png$/, "") },
    props: { title: page.title },
  }));
}
export const GET: APIRoute = ({ props }) =>
  createSocialImage("lab", props.title, origin);
