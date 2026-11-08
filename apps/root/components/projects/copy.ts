import { DEFAULT_LOCALE, type LocaleId } from "../../../../site/locales";
import { ptProjectsCopy, ptStuccoCopy } from "../../lib/pt";
import { projectsCopy, type ProjectsCopy } from "../../lib/projects";
import { stuccoCopy, type StuccoCopy } from "../../lib/stucco";

/** The projects copy of a locale: English from lib/projects.ts, Portuguese from lib/pt.ts. */
export function projectsCopyFor(locale: LocaleId): ProjectsCopy {
  return locale === DEFAULT_LOCALE ? projectsCopy : ptProjectsCopy;
}

/** The Stucco. case page's copy in a locale. */
export function stuccoCopyFor(locale: LocaleId): StuccoCopy {
  return locale === DEFAULT_LOCALE ? stuccoCopy : ptStuccoCopy;
}
