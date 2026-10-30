import type { ClassifierCategory } from "./bench-copy.ts";
import { countedFor, type PluralForms } from "./plural-core.ts";

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
 * The bench's live summary: the localized, count-aware sentence, then each
 * category's display name with its count. The browser script and the static
 * markup both render this one result.
 */
export function summaryParts(
  intlLocale: string,
  total: number,
  counts: Record<ClassifierCategory, number>,
  forms: PluralForms,
  labels: Record<ClassifierCategory, string>,
): TextPart[] {
  const parts: TextPart[] = [{ text: countedFor(intlLocale, total, forms) }];
  for (const category of classifierCategories)
    parts.push({ text: ` · ${labels[category]} ${counts[category]}` });
  return parts;
}

/**
 * A destination preview. The category folder is Sweep's real directory name
 * (`Images`, `Documents`, ...), an identifier, so it keeps its own language
 * (`folderLang`) wherever the page's language differs.
 */
export function destinationParts(
  directory: string,
  category: ClassifierCategory,
  filename: string,
  folderLang?: string,
): TextPart[] {
  return [
    { text: `${directory}/` },
    { text: category, lang: folderLang },
    { text: `/${filename}` },
  ];
}
