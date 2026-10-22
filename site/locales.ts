// The locale registry, defined once (docs/i18n.md). Like sites.ts this layer is
// neutral and imports nothing. It holds protocol spellings, URL-prefix rules
// and which apps participate in which locale. Whether a given page exists in a
// locale is app content; nothing here knows or guesses it. The app ids below
// are the ones in sites.ts; a test keeps the two lists equal.

type SiteId = "root" | "dump" | "docs" | "lab";

export interface Locale {
  /** The internal identifier, also the key of the registry. */
  id: string;
  language: string;
  /** Null when the locale is not regional. */
  region: string | null;
  /** The URL prefix with its leading slash, or "" for the unprefixed default. */
  urlPrefix: string;
  htmlLang: string;
  hreflang: string;
  openGraphLocale: string;
  /** Structured-data `inLanguage`. */
  inLanguage: string;
  /** RSS `<language>`. */
  rssLanguage: string;
  /** The `Intl` formatting locale. */
  intlLocale: string;
  /** The language's name in itself, for assistive technology. */
  name: string;
  /** The short label shown in the language control. */
  label: string;
}

export const LOCALES = {
  en: {
    id: "en",
    language: "en",
    region: null,
    urlPrefix: "",
    htmlLang: "en",
    hreflang: "en",
    openGraphLocale: "en_US",
    inLanguage: "en",
    rssLanguage: "en",
    intlLocale: "en-US",
    name: "English",
    label: "EN",
  },
  "pt-BR": {
    id: "pt-BR",
    language: "pt",
    region: "BR",
    urlPrefix: "/pt",
    htmlLang: "pt-BR",
    hreflang: "pt-BR",
    openGraphLocale: "pt_BR",
    inLanguage: "pt-BR",
    rssLanguage: "pt-BR",
    intlLocale: "pt-BR",
    name: "Português (Brasil)",
    label: "PT",
  },
} as const satisfies Record<string, Locale>;

export type LocaleId = keyof typeof LOCALES;

export const LOCALE_IDS = Object.keys(LOCALES) as readonly LocaleId[];

/** Unprefixed, the `x-default` target, and the language of every existing URL. */
export const DEFAULT_LOCALE = "en" satisfies LocaleId;

export function isLocaleId(value: unknown): value is LocaleId {
  return (
    typeof value === "string" &&
    Object.prototype.hasOwnProperty.call(LOCALES, value)
  );
}

export function localeById(id: LocaleId): Locale {
  return LOCALES[id];
}

/**
 * Whether an app's public contract in a locale is live in production and
 * verified. Only the activation change for that app turns Portuguese on, and
 * only after publication is verified (docs/i18n.md, "Publish before
 * advertise"). Every cross-host use of a locale reads this.
 */
export const localeParticipation: Record<SiteId, Record<LocaleId, boolean>> = {
  root: { en: true, "pt-BR": false },
  dump: { en: true, "pt-BR": true },
  docs: { en: true, "pt-BR": false },
  lab: { en: true, "pt-BR": false },
};

export function participates(site: SiteId, locale: LocaleId): boolean {
  return localeParticipation[site][locale];
}

/**
 * Each host's trailing-slash convention for page paths. Next.js hosts (Root,
 * Dump) end none; Astro hosts (Docs, Lab) end every page path with "/". The
 * policy itself is configured in each app; a test keeps this table in step.
 */
export const trailingSlash: Record<SiteId, "never" | "always"> = {
  root: "never",
  dump: "never",
  docs: "always",
  lab: "always",
};

function requirePath(pathname: string): void {
  if (
    typeof pathname !== "string" ||
    !pathname.startsWith("/") ||
    pathname.startsWith("//") ||
    /[?#]/.test(pathname)
  )
    throw new RangeError(
      `Expected an absolute path, received ${JSON.stringify(pathname)}`,
    );
}

/** The prefixed locales, whose first path segment is reserved on every host. */
const prefixed = LOCALE_IDS.filter((id) => LOCALES[id].urlPrefix !== "");

function prefixedLocaleOf(pathname: string): LocaleId | undefined {
  const first = pathname.split("/")[1];
  return prefixed.find((id) => LOCALES[id].urlPrefix === `/${first}`);
}

/**
 * The locale a path belongs to. Only the exact first segment of a prefix
 * selects it (`/pt`, `/pt/`, `/pt/about`); `/ptx`, `/PT`, `/foo/pt` and
 * `/posts/pt-debugging` are English. A deterministic function of the path.
 */
export function localeOfPath(pathname: string): LocaleId {
  requirePath(pathname);
  return prefixedLocaleOf(pathname) ?? DEFAULT_LOCALE;
}

/** Whether the first segment is a locale prefix, so no English route may use it. */
export function isReservedPath(pathname: string): boolean {
  requirePath(pathname);
  return prefixedLocaleOf(pathname) !== undefined;
}

/**
 * The locale-neutral path: `/pt/about` and `/pt/about/` become `/about` and
 * `/about/`, `/pt` becomes `/`. Unprefixed paths are returned unchanged. The
 * host's own trailing-slash form of the remainder is preserved as received.
 */
export function stripLocalePrefix(pathname: string): string {
  requirePath(pathname);
  const id = prefixedLocaleOf(pathname);
  if (!id) return pathname;
  return pathname.slice(LOCALES[id].urlPrefix.length) || "/";
}

/**
 * A neutral host path in the given locale, in the host's own trailing-slash
 * form. `path` must already be in that form (it is not normalized, so files
 * such as `/rss.xml` stay as they are); only the locale's root, which has no
 * form of its own, follows the host convention: `/pt` on Root and Dump, `/pt/`
 * on Docs and Lab. English is returned unchanged. This builds a path only; it
 * does not know whether the page exists in that locale. A path that is already
 * reserved is rejected rather than prefixed twice.
 */
export function localizedPath(
  site: SiteId,
  locale: LocaleId,
  path: string,
): string {
  requirePath(path);
  if (!isLocaleId(locale))
    throw new RangeError(`Unsupported locale ${JSON.stringify(locale)}`);
  if (isReservedPath(path))
    throw new RangeError(
      `Expected a locale-neutral path, received ${JSON.stringify(path)}`,
    );
  const prefix = LOCALES[locale].urlPrefix;
  if (path === "/")
    return prefix === ""
      ? "/"
      : trailingSlash[site] === "always"
        ? `${prefix}/`
        : prefix;
  return prefix + path;
}
