// A tiny module on its own, so the catalog's client component can use it
// without bundling the project copy.

/** `08 projects`: two digits, in the locale's plural form. */
export function countLabel(count: { one: string; other: string }, n: number) {
  return (n === 1 ? count.one : count.other).replace(
    "{n}",
    String(n).padStart(2, "0"),
  );
}
