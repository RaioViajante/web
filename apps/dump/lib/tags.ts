import { isLocaleId, type LocaleId } from "../../../site/locales";
import definitions from "../content/tags.json";

// Dump's tag taxonomy. A tag has a stable internal id (what posts reference and
// what queries filter on), and, per locale, a display label and a URL slug.
// None of the three is derived from another: the id is not a slug, and a
// localized slug never identifies the tag. Dump owns this; `site/` knows
// nothing about it. A locale without a presentation for a tag cannot use it.

export type TagId = string;

export interface TagPresentation {
  /** What a reader sees. */
  label: string;
  /** The `/tags/<slug>` segment in this locale. */
  slug: string;
}

export interface TagDefinition {
  id: TagId;
  locales: Partial<Record<LocaleId, TagPresentation>>;
}

const KEBAB = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const tagDefinitions = definitions as readonly TagDefinition[];

export interface Taxonomy {
  definitions: readonly TagDefinition[];
  /** The presentation of a tag in a locale; undefined when the tag or locale is not defined. */
  presentation(id: TagId, locale: LocaleId): TagPresentation | undefined;
  /** The tag id behind a locale's URL slug. */
  idForSlug(locale: LocaleId, slug: string): TagId | undefined;
}

/** Validates the definitions and builds the lookups. Throws naming the tag, locale and conflict. */
export function createTaxonomy(
  definitions: readonly TagDefinition[],
): Taxonomy {
  const byId = new Map<TagId, TagDefinition>();
  const bySlug = new Map<string, TagId>();
  for (const definition of definitions) {
    if (!KEBAB.test(definition.id))
      throw new Error(
        `Invalid tag id "${definition.id}": use lowercase letters, digits and hyphens.`,
      );
    if (byId.has(definition.id))
      throw new Error(`Tag id "${definition.id}" is defined twice.`);
    byId.set(definition.id, definition);
    for (const [locale, presentation] of Object.entries(definition.locales)) {
      if (!isLocaleId(locale))
        throw new Error(
          `Tag "${definition.id}" has an unsupported locale "${locale}".`,
        );
      if (!presentation.label.trim())
        throw new Error(
          `Tag "${definition.id}" (${locale}) has an empty label.`,
        );
      if (!KEBAB.test(presentation.slug))
        throw new Error(
          `Tag "${definition.id}" (${locale}) has an invalid slug "${presentation.slug}": use lowercase letters, digits and hyphens.`,
        );
      const key = `${locale} ${presentation.slug}`;
      const owner = bySlug.get(key);
      if (owner)
        throw new Error(
          `Tag slug "${presentation.slug}" in ${locale} is used by both "${owner}" and "${definition.id}".`,
        );
      bySlug.set(key, definition.id);
    }
  }
  return {
    definitions,
    presentation: (id, locale) => byId.get(id)?.locales[locale],
    idForSlug: (locale, slug) => bySlug.get(`${locale} ${slug}`),
  };
}

export const taxonomy = createTaxonomy(tagDefinitions);

/** A locale's tag by its URL slug, or undefined when that locale has no such tag. */
export function tagFromSlug(
  locale: LocaleId,
  slug: string,
  from: Taxonomy = taxonomy,
): ({ id: TagId } & TagPresentation) | undefined {
  const id = from.idForSlug(locale, slug.toLowerCase());
  const found = id ? from.presentation(id, locale) : undefined;
  return id && found ? { id, ...found } : undefined;
}

/** The presentation a post's locale requires; a missing one is an error, never English. */
export function tagPresentation(
  id: TagId,
  locale: LocaleId,
  from: Taxonomy = taxonomy,
): TagPresentation {
  const found = from.presentation(id, locale);
  if (!found)
    throw new Error(`Tag "${id}" has no presentation for locale ${locale}.`);
  return found;
}
