/**
 * Fills `{name}` placeholders in a catalog string. Interactive scripts receive
 * their strings rendered into the page at build time and fill the dynamic
 * parts here; an unknown placeholder is a bug, not an empty string.
 */
export function fill(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, name: string) => {
    if (!(name in values))
      throw new RangeError(`Missing value for {${name}} in "${template}"`);
    return String(values[name]);
  });
}

/** The placeholder names of a catalog string, for parity tests. */
export function placeholders(template: string): string[] {
  return [...template.matchAll(/\{(\w+)\}/g)].map((match) => match[1]!).sort();
}
