import { DEFAULT_LOCALE, type LocaleId } from "../../../../site/locales";
import { ptProjectsCopy } from "../../lib/pt";
import { projectsCopy, type ProjectsCopy } from "../../lib/projects";

/** The projects copy of a locale: English from lib/projects.ts, Portuguese from lib/pt.ts. */
export function projectsCopyFor(locale: LocaleId): ProjectsCopy {
  return locale === DEFAULT_LOCALE ? projectsCopy : ptProjectsCopy;
}
