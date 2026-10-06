/** `01.` for the first section of a post, then `01.1`, `01.2`, … */
export function sectionNumber(index: number): string {
  return index === 0 ? "01." : `01.${index}`;
}
