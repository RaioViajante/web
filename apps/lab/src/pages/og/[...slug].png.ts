import type { APIRoute } from "astro";
import {
  createSiteSocialImage,
  createSocialImage,
} from "@raioviajante/design/social-image";
import { socialKey } from "../../../../../seo/metadata";
import { LOCALE_IDS } from "../../../../../site/locales";
import { textFor } from "../../lib/copy";
import { routePath } from "../../lib/routes";
import { getSeoPages, origin } from "../../lib/seo";
export function getStaticPaths() {
  return getSeoPages().map((page) => ({
    params: { slug: socialKey(page.path).replace(/\.png$/, "") },
    props: { title: page.title, path: page.path },
  }));
}
const fidelity = ["runs here", "simulated", "source only"] as const;
// The home is the family's card, with Lab's three kinds of fidelity; every
// other page keeps its own title card.
export const GET: APIRoute = ({ props }) => {
  const locale = LOCALE_IDS.find((id) => routePath("home", id) === props.path);
  if (!locale) return createSocialImage("lab", props.title, origin);
  const text = textFor(locale);
  return createSiteSocialImage(
    "lab",
    locale,
    text.tagline,
    fidelity.map((kind) => ({
      name: text.fidelityLabel[kind],
      // The first clause is enough for a card.
      note: text.fidelityHelp[kind].split(";")[0]!,
    })),
  );
};
