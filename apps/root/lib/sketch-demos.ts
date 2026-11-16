// The example values drawn in the Mochifile sketch, kept apart from React so a
// plain Node test can check them. Nothing here talks to a real backend.

/**
 * Mochifile: an example photo compressed to a target size. Mochifile counts
 * sizes in decimal units (a 50 KB result is at most 50,000 bytes), and its
 * preset pages include these targets. The result sizes are example values,
 * shown as such; the real tool reports the real size of your file.
 */
export const mochifileOriginal = { kb: 4800, width: 4032, height: 3024 };
export const mochifileTargets = [50, 200, 500, 1000] as const;
export type MochifileTarget = (typeof mochifileTargets)[number];

export function mochifileResult(target: MochifileTarget) {
  const kb = Math.round(target * 0.96);
  return {
    kb,
    reduction: Math.round((1 - kb / mochifileOriginal.kb) * 100),
    /** The share of the original, for the size bar (at least a sliver). */
    share: Math.max(2, Math.round((kb / mochifileOriginal.kb) * 100)),
  };
}

/** `4.8 MB`, `192 KB`, in the locale's number format. */
export function formatSize(kb: number, intlLocale: string) {
  if (kb >= 1000)
    return `${new Intl.NumberFormat(intlLocale, {
      maximumFractionDigits: 1,
    }).format(kb / 1000)} MB`;
  return `${new Intl.NumberFormat(intlLocale).format(kb)} KB`;
}
