import { notFoundSeo } from "../../../../seo/metadata";
import { publishedExperiments, experimentPath } from "../data/experiments";
import { siteOrigins } from "../../../../site/sites";
export const origin = siteOrigins.lab;
export function getSeoPages() {
  return [
    { path: "/", title: "things may break." },
    { path: "/search/", title: "search" },
    { path: "/pt/", title: "experimentos podem falhar." },
    { path: "/pt/search/", title: "busca" },
    { path: "/terms/", title: "Terms of Use" },
    { path: "/privacy/", title: "Privacy Policy" },
    notFoundSeo,
    ...publishedExperiments.map((experiment) => ({
      path: experimentPath(experiment),
      title: experiment.title,
    })),
  ];
}
