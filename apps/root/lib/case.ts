// The parts every case page shares: its tour and its demo layer. Each case's
// copy (stucco.ts, quadra.ts) uses these shapes for those parts. This file
// imports nothing, so a plain Node test can load it.

export type CaseDevice = "desktop" | "mobile";

export interface CaseStep {
  title: string;
  caption: string;
}

export interface CaseTourCopy<Group extends string = string> {
  heading: string;
  device: string;
  steps: string;
  desktop: string;
  mobile: string;
  previous: string;
  next: string;
  /** Alt text of a screenshot; takes {device} and {title}. */
  shotAlt: string;
  groups: Record<Group, string>;
  captions: Record<CaseDevice, Record<string, CaseStep>>;
}

export interface CaseDemoCopy {
  open: string;
  hint: string;
  label: string;
  newTab: string;
  close: string;
  loading: string;
}
