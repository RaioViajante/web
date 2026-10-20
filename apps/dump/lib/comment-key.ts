import type { LocaleId } from "../../../site/locales";

/**
 * Repository configuration for the giscus GitHub Discussions backend (see
 * docs/comments.md for how it was retrieved). Shared by the widget and by the
 * identity checks so both read one source.
 */
export const GISCUS = {
  repo: "RaioViajante/web",
  repoId: "R_kgDOUu8oYA",
  category: "Comments",
  categoryId: "DIC_kwDOUu8oYM4DGx0J",
} as const;

/**
 * The locale-independent key of a work's discussion: `posts/<contentId>`.
 * Every localized version of a work shares it, and it depends on nothing but
 * the stable `contentId`: not slug, title, locale, date or origin.
 */
export function commentKey(contentId: string): string {
  return `posts/${contentId}`;
}

/**
 * The term giscus derived under `data-mapping="pathname"` for an English
 * post: its path without the leading slash. Existing discussions were created
 * under it; only used to prove that `commentKey` reproduces it.
 */
export function legacyPathnameTerm(slug: string): string {
  return `posts/${slug}`;
}

/**
 * giscus UI language per locale. giscus ships one Portuguese interface, `pt`;
 * it has no `pt-BR` (its supported list: github.com/giscus/giscus `i18n.js`).
 * Typed over every locale so adding one cannot silently fall back.
 */
const GISCUS_LANG: Record<LocaleId, string> = {
  en: "en",
  "pt-BR": "pt",
};

export function giscusLang(locale: LocaleId): string {
  return GISCUS_LANG[locale];
}
