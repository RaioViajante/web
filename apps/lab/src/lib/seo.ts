import { notFoundSeo } from "../../../../seo/metadata";
import { LOCALE_IDS } from "../../../../site/locales";
import { publishedExperiments, experimentPath } from "../data/experiments";
import { siteOrigins } from "../../../../site/sites";
import { textFor } from "./copy";
import { routePath } from "./routes";
export const origin = siteOrigins.lab;

/** Every indexable or card-bearing page, with the title its social card shows. */
export function getSeoPages() {
  return [
    ...LOCALE_IDS.flatMap((locale) => {
      const text = textFor(locale);
      return [
        { path: routePath("home", locale), title: text.tagline },
        { path: routePath("search", locale), title: text.search.title },
        { path: routePath("terms", locale), title: text.legal.terms.title },
        {
          path: routePath("privacy", locale),
          title: text.legal.privacy.title,
        },
      ];
    }),
    notFoundSeo,
    ...publishedExperiments.map((experiment) => ({
      path: experimentPath(experiment),
      title: experiment.title,
    })),
  ];
}
