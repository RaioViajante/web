import { notFoundSeo } from "@raioviajante/design/seo";
import { experiments } from "../data/experiments";
import { siteOrigins } from "../../../../site/sites";
export const origin = siteOrigins.lab;
export function getSeoPages() {
  return [
    { path: "/", title: "things may break." },
    { path: "/search/", title: "search" },
    { path: "/terms/", title: "Terms of Use" },
    { path: "/privacy/", title: "Privacy Policy" },
    notFoundSeo,
    ...experiments.map((experiment) => ({
      path: `/experiments/${experiment.slug}/`,
      title: experiment.title,
    })),
  ];
}
