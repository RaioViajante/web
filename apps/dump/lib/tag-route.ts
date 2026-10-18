import { DEFAULT_LOCALE, type LocaleId } from "../../../site/locales.ts";

// A tag slug is one decoded path segment. Percent is deliberately excluded:
// accepting it after one decode would make `%252F` ambiguous with a second
// decoding pass. Reserved characters such as `+`, `#` and `?` remain valid
// tag data and are encoded exactly once when a URL is built.
const INVALID_TAG_SLUG = /[/%\\\s\u0000-\u001f\u007f]/u;

function normalizedTagSlug(slug: string): string | undefined {
  if (!slug || slug !== slug.trim() || INVALID_TAG_SLUG.test(slug))
    return undefined;
  const normalized = slug.normalize("NFC");
  if (normalized === "." || normalized === "..") return undefined;
  return normalized;
}

/** Validate an authoritative taxonomy slug and return its NFC identity. */
export function canonicalTagSlug(slug: string): string {
  const normalized = normalizedTagSlug(slug);
  if (!normalized || normalized !== slug)
    throw new RangeError(`Invalid canonical tag slug ${JSON.stringify(slug)}.`);
  // encodeURIComponent is also the definitive well-formed Unicode check.
  try {
    encodeURIComponent(slug);
  } catch {
    throw new RangeError(`Invalid canonical tag slug ${JSON.stringify(slug)}.`);
  }
  return slug;
}

/** Encode one already-decoded authoritative tag slug exactly once. */
export function encodeTagSlug(slug: string): string {
  return encodeURIComponent(canonicalTagSlug(slug));
}

/**
 * Decode one raw URL segment exactly once. Invalid escapes, path separators
 * and input that still contains a percent escape marker are rejected.
 */
export function decodeTagPathSegment(segment: string): string | undefined {
  let decoded: string;
  try {
    decoded = decodeURIComponent(segment);
  } catch {
    return undefined;
  }
  return normalizedTagSlug(decoded);
}

/**
 * The membership key for a decoded tag slug. English keeps its established
 * case-insensitive lookup; localized Portuguese slugs are exact.
 */
export function tagLookupSlug(
  locale: LocaleId,
  slug: string,
): string | undefined {
  const normalized = normalizedTagSlug(slug);
  if (!normalized) return undefined;
  return locale === DEFAULT_LOCALE
    ? normalized.toLocaleLowerCase("en-US").normalize("NFC")
    : normalized;
}
