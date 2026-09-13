export type ExperimentStatus = "active" | "archived";

/**
 * "canonical" (default) keeps the experiment surface inside the same 680px
 * column as the rest of the site. "wide" is an opt-in breakout for an
 * experiment that genuinely needs more horizontal space (a waveform editor,
 * a node graph, a large canvas) — see docs/design.md. Neither current
 * demonstration experiment uses it.
 */
export type ExperimentLayout = "canonical" | "wide";

/**
 * Selects a bespoke Astro component to render inside the "experiment"
 * section of the experiment page. Optional: an experiment without a
 * dedicated interactive surface still gets the full metadata/prose page,
 * just without this section.
 */
export type ExperimentSurface = "parser-playground" | "boot-sector";

export interface Experiment {
  id: string;
  slug: string;
  title: string;
  description: string;
  status: ExperimentStatus;
  created: string;
  source?: string;
  what: string;
  notes?: string;
  layout?: ExperimentLayout;
  surface?: ExperimentSurface;
}

/**
 * Temporary demonstration entries carried over from the approved design
 * reference (reference/claude-export/Lab.dc.html) — see docs/content.md.
 * They exist to establish the homepage list and experiment page system, not
 * as real projects, and will be replaced with real RaioViajante experiments.
 */
export const experiments: Experiment[] = [
  {
    id: "017",
    slug: "parser-playground",
    title: "parser playground",
    description: "syntax experiments before they become language decisions",
    status: "active",
    created: "2026-09-01",
    source: "https://github.com/raioviajante/parser-playground",
    what: "Before a language decides what it is, someone has to guess how it should read. This is that guessing, made visible.",
    surface: "parser-playground",
  },
  {
    id: "016",
    slug: "cron-visualizer",
    title: "cron visualizer",
    description: "making schedules less unpleasant to look at",
    status: "active",
    created: "2026-08-20",
    source: "https://github.com/raioviajante/cron-visualizer",
    what: "Cron expressions are precise and unreadable at the same time. I wanted to see them as time, not syntax.",
  },
  {
    id: "014",
    slug: "filesystem-classifier",
    title: "filesystem classifier",
    description: "experimenting with how files decide where they belong",
    status: "active",
    created: "2026-09-13",
    source: "https://github.com/raioviajante/filesystem-classifier",
    what: "I wanted to see how reliably a file could be classified without turning the whole thing into something much larger than it needed to be.",
    notes:
      "Extension matching gets it right more often than it should. The interesting failures are the ambiguous ones.",
  },
  {
    id: "006",
    slug: "boot-sector",
    title: "boot sector",
    description: "512 bytes and bad decisions",
    status: "archived",
    created: "2024-02-02",
    source: "https://github.com/raioviajante/boot-sector",
    what: "512 bytes, no operating system, no safety net. Just enough instructions to prove the machine is listening.",
    notes:
      "The signature at the end (0x55AA) is the only thing standing between this and garbage.",
    surface: "boot-sector",
  },
];

export function getExperiment(slug: string): Experiment | undefined {
  return experiments.find((experiment) => experiment.slug === slug);
}
