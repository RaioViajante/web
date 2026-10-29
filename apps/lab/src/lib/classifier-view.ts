import type { LocaleId } from "../../../../site/locales.ts";
import type { ClassifierCategory } from "./bench-copy.ts";
import { pluralCategory, type PluralForms } from "./plural.ts";
import { fill } from "./template.ts";

/** A run of text, optionally in another language than the page. */
export interface TextPart {
  text: string;
  lang?: string;
}

export const classifierCategories: readonly ClassifierCategory[] = [
  "Images",
  "Documents",
  "Archives",
  "Other",
];

export function emptyCounts(): Record<ClassifierCategory, number> {
  return { Images: 0, Documents: 0, Archives: 0, Other: 0 };
}

/**
 * The bench's live summary: the localized, count-aware sentence, then each real
 * category value (Sweep's own, in `categoryLang` when that differs from the
 * page) with its count. The browser script and the static markup both render
 * this one result.
 */
export function summaryParts(
  locale: LocaleId,
  total: number,
  counts: Record<ClassifierCategory, number>,
  forms: PluralForms,
  categoryLang?: string,
): TextPart[] {
  const parts: TextPart[] = [
    { text: fill(forms[pluralCategory(locale, total)], { count: total }) },
  ];
  for (const category of classifierCategories)
    parts.push(
      { text: " · " },
      { text: category, lang: categoryLang },
      { text: ` ${counts[category]}` },
    );
  return parts;
}

/** A category cell: the real value, then an optional descriptive gloss. */
export function categoryParts(
  category: ClassifierCategory,
  gloss: string | null,
  categoryLang?: string,
): TextPart[] {
  return [
    { text: category, lang: categoryLang },
    ...(gloss ? [{ text: ` (${gloss})` }] : []),
  ];
}
