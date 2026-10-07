export type ExperimentStatus = "active" | "done" | "archived";

/**
 * Selects a bespoke Astro component to render inside the "experiment"
 * section of the experiment page. Optional: an experiment without a
 * dedicated interactive surface still gets the full metadata/prose page,
 * just without this section.
 */
export type ExperimentSurface =
  "filename-classifier" | "execution-states" | "boot-sector";

export interface Experiment {
  id: string;
  slug: string;
  title: string;
  description: string;
  status: ExperimentStatus;
  project: string;
  revision: string;
  fidelity: "runs here" | "simulated" | "source only";
  created: string;
  source?: string;
  what: string;
  notes?: string;
  surface?: ExperimentSurface;
}

/** Real experiments, ordered by descending publication number. */
export const experiments: Experiment[] = [
  {
    id: "003",
    slug: "boot-sector",
    surface: "boot-sector",
    title: "boot sector",
    description: "the assembly behind a BIOS hello world",
    status: "done",
    project: "x86-os-experiment",
    revision: "e966889",
    fidelity: "source only",
    created: "2026-09-13",
    source: "https://github.com/RaioViajante/x86-os-experiment",
    what: "How does this boot sector get a message on screen using BIOS services? The actual assembly from an x86 learning experiment, alongside the behavior recorded in its learning notes. The Lab presents the source; it does not boot or emulate it.",
    notes:
      "Based on x86-os-experiment revision e966889. The Hello, World! result is documented in the project notes, not independently reproduced here.",
  },
  {
    id: "002",
    slug: "execution-states",
    surface: "execution-states",
    title: "execution states",
    description:
      "trying the transitions Orbit allows — and the ones it rejects",
    status: "active",
    project: "orbit",
    revision: "cd97666",
    fidelity: "simulated",
    created: "2026-09-13",
    source: "https://github.com/RaioViajante/orbit",
    what: "Which operations does each state accept, and what does a rejected one look like? An interactive representation of Orbit’s current Execution domain rules. State changes happen in this browser example: no commands run, and there is no scheduler behind the page.",
    notes:
      "Based on Orbit revision cd97666. Timestamps are browser-generated sample values, with no persistence. Retry and timeout settings are configuration only.",
  },
  {
    id: "001",
    slug: "filename-classifier",
    surface: "filename-classifier",
    title: "filename classifier",
    description: "seeing where Sweep puts a filename",
    status: "active",
    project: "sweep",
    revision: "3544d36",
    fidelity: "runs here",
    created: "2026-09-13",
    source: "https://github.com/RaioViajante/sweep",
    what: "Given only a filename, which category does Sweep pick, and where would the file end up? Sweep classifies files by their final extension before deciding where they belong. This reproduces that small part of its current behavior in the browser; Sweep itself is not running here.",
    notes:
      "Based on Sweep revision 3544d36. Only filename extensions are considered. No files are uploaded, inspected, or moved.",
  },
];

export function getExperiment(slug: string): Experiment | undefined {
  return experiments.find((experiment) => experiment.slug === slug);
}
