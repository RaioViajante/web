// The logic behind the interactive project sketches, kept apart from React so
// a plain Node test can check it. Nothing here talks to a real backend.

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

/**
 * Orbit: the execution states and the transitions its domain allows, as
 * verified for the Lab's execution-states experiment: start from QUEUED;
 * succeed and fail from RUNNING; cancel from QUEUED or RUNNING. Finished
 * states accept nothing.
 */
export type ExecutionState =
  "queued" | "running" | "succeeded" | "failed" | "cancelled";
export type ExecutionAction = "start" | "succeed" | "fail" | "cancel";

const allowed: Record<ExecutionAction, readonly ExecutionState[]> = {
  start: ["queued"],
  succeed: ["running"],
  fail: ["running"],
  cancel: ["queued", "running"],
};
const result: Record<ExecutionAction, ExecutionState> = {
  start: "running",
  succeed: "succeeded",
  fail: "failed",
  cancel: "cancelled",
};

/** The next state, or `undefined` when the action is rejected. */
export function transition(state: ExecutionState, action: ExecutionAction) {
  return allowed[action].includes(state) ? result[action] : undefined;
}

export const isFinished = (state: ExecutionState) =>
  state === "succeeded" || state === "failed" || state === "cancelled";
