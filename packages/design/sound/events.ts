/**
 * The sound map: every interaction event, the kind that plays for it, and
 * how it is triggered. DESIGN-SYSTEM section 5b names these `[ROOT: kind]`.
 */
export type SoundAction = "hover" | "click";

export type SoundKind =
  | "nav"
  | "hover"
  | "click"
  | "open"
  | "tick"
  | "copy"
  | "toggle"
  | "success"
  | "reject"
  // original root and dump kinds, kept as they are
  | "flip"
  | "gallery"
  | "gallery-reveal"
  | "typing";

/** `hover` is very soft: at most one per 80ms. `tick` is the quietest. */
export const HOVER_THROTTLE_MS = 80;
export const TICK_THROTTLE_MS = 45;

/** Kinds a `data-sound` element plays when the pointer enters it. */
export const HOVER_KINDS: ReadonlySet<string> = new Set([
  "nav",
  "hover",
  "gallery",
]);

/** Event name for programmatic sounds: `playSound("success")`. */
export const SOUND_EVENT = "rv-sound";

export interface SoundMapEntry {
  event: string;
  where: string;
  kind: SoundKind;
  trigger: "data-sound" | "playSound";
}

export const SOUND_MAP: readonly SoundMapEntry[] = [
  {
    event: "toggle sound",
    where: "SOUND ON / OFF",
    kind: "toggle",
    trigger: "data-sound",
  },
  {
    event: "hover nav item",
    where: "sidebar, leaders",
    kind: "nav",
    trigger: "data-sound",
  },
  {
    event: "open link / page",
    where: "any link",
    kind: "nav",
    trigger: "data-sound",
  },
  {
    event: "open search",
    where: "sidebar item, / and Cmd+K",
    kind: "open",
    trigger: "playSound",
  },
  {
    event: "type in search",
    where: "search input",
    kind: "tick",
    trigger: "data-sound",
  },
  {
    event: "move selection",
    where: "arrow keys in results",
    kind: "hover",
    trigger: "playSound",
  },
  {
    event: "copy",
    where: "code, terminal",
    kind: "copy",
    trigger: "playSound",
  },
  {
    event: "switch tab / filter",
    where: "docs tabs, lab filter, search scope",
    kind: "click",
    trigger: "data-sound",
  },
  {
    event: "expand / collapse",
    where: "long code",
    kind: "click",
    trigger: "playSound",
  },
  {
    event: "action accepted",
    where: "lab bench",
    kind: "success",
    trigger: "playSound",
  },
  {
    event: "action rejected",
    where: "lab bench",
    kind: "reject",
    trigger: "playSound",
  },
];
