/**
 * Compatibility entry for the root and dump sound toggles. The synthesis and
 * delegation now live in `./sound`; this file keeps the original names until
 * both apps move to the shared `SoundToggle`.
 */
export type { SoundAction as EditorialSoundAction } from "./sound/events";
export { createSynth as createEditorialSound } from "./sound/synth";
export { attachSoundEvents as attachEditorialSoundEvents } from "./sound/player";
