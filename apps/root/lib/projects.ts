// Root's projects: stable facts (names, kinds, stages, public destinations)
// and the English copy, including every word drawn inside the project
// sketches. Portuguese copy is `ptProjectsCopy` in pt.ts, typed by the same
// `ProjectsCopy`, so a missing translation is a type error.
//
// Facts here were checked on 2026-11-04: Mochifile, Ordelis, Orbit, yanawa
// and Sweep against their Docs pages (which record their verified commits),
// Hum against its public README, Refrain against its Dump essay. Refrain and
// Morrowferry have private repositories, which are never linked; their
// descriptions were confirmed against the owner's own READMEs and the
// approved design copy, and say nothing more specific than those. A sketch illustrates a
// project; it never claims a capability the project does not have, and
// example numbers say so where they appear. This file imports types only
// (and the locale registry), so a plain Node test can load it.

import { participates, type LocaleId } from "../../../site/locales.ts";
import type { SiteId } from "../../../site/sites.ts";

export type ProjectId =
  | "mochifile"
  | "ordelis"
  | "refrain"
  | "orbit"
  | "yanawa"
  | "sweep"
  | "hum"
  | "morrowferry";

export type ProjectCategory =
  "tools" | "music" | "systems" | "languages" | "games";

/** How far along a project is, shown by the shape of its status mark. */
export type ProjectStage = "usable" | "building";

export interface ProjectLink {
  /** The site serving the destination, when it is one of the four. */
  site?: Exclude<SiteId, "root">;
  href: { en: string; "pt-BR"?: string };
}

export interface Project {
  id: ProjectId;
  name: string;
  category: ProjectCategory;
  stage: ProjectStage;
  /** One of the four on /projects and the home page. */
  featured: boolean;
  /** Projects with an approved icon; the others show their initial instead. */
  icon: boolean;
  link?: ProjectLink;
}

const docs = "https://docs.raioviajante.com";
const dump = "https://dump.raioviajante.com";
const lab = "https://lab.raioviajante.com";

export const projects: readonly Project[] = [
  {
    id: "mochifile",
    name: "Mochifile",
    category: "tools",
    stage: "usable",
    featured: true,
    icon: true,
    link: {
      href: {
        en: "https://mochifile.com",
        "pt-BR": "https://mochifile.com/pt/",
      },
    },
  },
  {
    id: "ordelis",
    name: "Ordelis",
    category: "tools",
    stage: "building",
    featured: true,
    icon: true,
    link: {
      site: "docs",
      href: {
        en: `${docs}/projects/ordelis/`,
        "pt-BR": `${docs}/pt/projetos/ordelis/`,
      },
    },
  },
  {
    id: "refrain",
    name: "Refrain",
    category: "music",
    stage: "building",
    featured: true,
    icon: true,
    link: {
      site: "dump",
      href: {
        en: `${dump}/posts/i-wanted-somewhere-to-put-all-these-songs`,
        "pt-BR": `${dump}/pt/posts/eu-queria-um-lugar-para-guardar-todas-essas-musicas`,
      },
    },
  },
  {
    id: "orbit",
    name: "Orbit",
    category: "systems",
    stage: "building",
    featured: true,
    icon: true,
    link: {
      site: "lab",
      href: {
        en: `${lab}/experiments/execution-states/`,
        "pt-BR": `${lab}/pt/experiments/estados-de-execucao/`,
      },
    },
  },
  {
    id: "yanawa",
    name: "yanawa",
    category: "languages",
    stage: "building",
    featured: false,
    icon: true,
    link: {
      site: "docs",
      href: {
        en: `${docs}/projects/yanawa/`,
        "pt-BR": `${docs}/pt/projetos/yanawa/`,
      },
    },
  },
  {
    id: "sweep",
    name: "Sweep",
    category: "tools",
    stage: "usable",
    featured: false,
    icon: false,
    link: {
      site: "docs",
      href: {
        en: `${docs}/projects/sweep/`,
        "pt-BR": `${docs}/pt/projetos/sweep/`,
      },
    },
  },
  {
    id: "hum",
    name: "Hum",
    category: "music",
    stage: "building",
    featured: false,
    icon: false,
    link: { href: { en: "https://github.com/RaioViajante/hum" } },
  },
  {
    id: "morrowferry",
    name: "Morrowferry",
    category: "games",
    stage: "building",
    featured: false,
    icon: true,
  },
];

export const featuredProjects = projects.filter((project) => project.featured);

/** Filter order on /projects/all. */
export const projectCategories: readonly ProjectCategory[] = [
  "tools",
  "music",
  "systems",
  "languages",
  "games",
];

/**
 * A project's destination in a locale. A localized destination is used only
 * while its host participates in the locale; otherwise the English one is
 * linked and says so through `hrefLang`.
 */
export function projectLink(project: Project, locale: LocaleId) {
  if (!project.link) return undefined;
  const { site, href } = project.link;
  const localized = href[locale];
  if (localized && (!site || participates(site, locale)))
    return { href: localized, hrefLang: locale };
  return { href: href.en, hrefLang: "en" as const };
}

/** Client work. Only real, published cases belong here; none exists yet. */
export interface ClientCase {
  id: string;
  client: string;
  year: string;
  scope: string;
  summary: string;
  href?: string;
}

export const clientCases: readonly ClientCase[] = [];

/** Every word a project card shows, per project. */
export interface ProjectText {
  /** Kind of project: the card subtitle and the catalog label. */
  meta: string;
  /** The short line under the name on the home page. */
  tagline: string;
  /** The full description on /projects and in search. */
  description: string;
  /** The shorter description in the catalog. */
  summary: string;
  /** The status word. */
  status: string;
  /** Link labels on /projects and in the catalog. */
  action?: string;
  actionShort?: string;
}

/** Copy of the project sketches. Code samples and product names are fixed. */
export interface ProjectArtCopy {
  /** Accessible name of each sketch. */
  label: Record<ProjectId, string>;
  /** Visible notes that values are examples or that a sketch is simulated. */
  example: string;
  simulated: string;
  mochifile: {
    tool: string;
    local: string;
    original: string;
    result: string;
    file: string;
    target: string;
    under: string;
    before: string;
    after: string;
  };
  ordelis: {
    note: string;
    task: string;
    agents: string;
    review: string;
    taskTitle: string;
    plan: string;
    implement: string;
    test: string;
    implementing: string;
    writingTests: string;
    revising: string;
    done: string;
    another: string;
    anotherNote: string;
    files: string;
    testsPassing: string;
    lintClean: string;
    openComment: string;
    you: string;
    waiting: string;
    approved: string;
    returned: string;
    approve: string;
    requestChanges: string;
  };
  refrain: {
    albums: string;
    artists: string;
    memories: string;
    title: string;
    tagline: string;
    play: string;
    stop: string;
    record: string;
  };
  orbit: {
    header: string;
    queued: string;
    running: string;
    succeeded: string;
    failed: string;
    cancelled: string;
    finished: string;
    queue: string;
    cancel: string;
    idle: string;
    full: string;
    log: string;
    counts: string;
  };
  yanawa: {
    note: string;
    tokens: string;
    tree: string;
  };
  sweep: {
    files: readonly [string, string, string, string];
    done: string;
  };
  hum: {
    note: string;
    nowPlaying: string;
    track: string;
    volume: string;
  };
}

export interface ProjectsCopy {
  projects: Record<ProjectId, ProjectText>;
  categories: Record<ProjectCategory, string>;
  noLink: string;
  /** Appended to a link whose destination exists only in English. */
  englishOnly: string;
  page: {
    label: string;
    title: string;
    line: string;
    mine: string;
    lead: string;
    viewAll: string;
    clients: string;
    clientsLead: string;
    clientsEmpty: string;
    clientsEmptyNote: string;
    caseLabel: string;
    caseSoon: string;
    cta: string;
  };
  all: {
    back: string;
    label: string;
    title: string;
    line: string;
    heading: string;
    filters: string;
    all: string;
    count: { one: string; other: string };
    cta: string;
  };
  home: {
    heading: string;
    more: string;
  };
  art: ProjectArtCopy;
}

export const projectsCopy: ProjectsCopy = {
  projects: {
    mochifile: {
      meta: "file tools / web",
      tagline: "file tools in the browser",
      description:
        "File tools for everyday chores, for people who just need the job done. Files are processed in your browser, never uploaded. Today there is one tool, which compresses an image to a target size; more are planned.",
      summary:
        "Compresses an image to a target size, right in the browser. More tools are planned.",
      status: "pre-launch",
      action: "Open Mochifile",
      actionShort: "mochifile.com",
    },
    ordelis: {
      meta: "coding agents / orchestration",
      tagline: "a workspace for coding agents",
      description:
        "A local-first desktop workspace for coordinating AI coding agents: plan a task, let agents work on it, review the evidence and decide what gets integrated. It is early: the desktop shows sample data, and the agent runtime it builds on runs only from the command line.",
      summary:
        "A desktop workspace for coordinating coding agents, with a person reviewing and deciding.",
      status: "early development",
      action: "Read the docs",
      actionShort: "the docs",
    },
    refrain: {
      meta: "music journal / personal",
      tagline: "a personal music journal",
      description:
        "My personal music journal: reviews, reflections and memories about albums, songs, artists and bands. It started as a Software Engineering assignment at university. Part of it runs on my computer; it is not online yet.",
      summary:
        "My personal music journal of albums, songs, artists and the memories around them.",
      status: "in development",
      action: "Read how it started",
      actionShort: "how it started",
    },
    orbit: {
      meta: "backend / job executions",
      tagline: "job executions and their states",
      description:
        "A self-hosted job scheduler in its early stages. Today it stores jobs, records executions and enforces the valid transitions between their states: queued, running, succeeded, failed and cancelled. Scheduling and running jobs are still planned.",
      summary:
        "Stores jobs and records how each execution moves between states. Scheduling is still planned.",
      status: "early development",
      action: "Try the experiment",
      actionShort: "the lab experiment",
    },
    yanawa: {
      meta: "programming language",
      tagline: "a programming language, on paper",
      description:
        "An experimental, strongly typed language for building applications. It exists as design documents; there is no compiler yet.",
      summary:
        "My own strongly typed language, for building applications. Still being designed: there is no compiler yet.",
      status: "in design",
      actionShort: "the docs",
    },
    sweep: {
      meta: "CLI / Python",
      tagline: "a file organizer for the terminal",
      description:
        "A command-line tool in Python that sorts the files in a folder into category directories by extension.",
      summary:
        "Sorts the files in a folder into category directories. preview shows the plan without moving anything.",
      status: "active",
      actionShort: "the docs",
    },
    hum: {
      meta: "music / terminal",
      tagline: "a terminal music player",
      description:
        "A local-first music player for the terminal, in Rust. It is being planned and specified; the player itself is not built yet.",
      summary:
        "A local-first terminal music player in Rust. Still being planned: the player is not built yet.",
      status: "planning",
      actionShort: "repository",
    },
    morrowferry: {
      meta: "game / storytelling",
      tagline: "a narrative pixel-art game",
      description:
        "A short narrative pixel-art game about an old ferryman and a boy looking for someone.",
      summary:
        "A short narrative pixel-art game about an old ferryman and a boy looking for someone. Melancholic, a little strange and warm.",
      status: "in development",
    },
  },
  categories: {
    tools: "tools",
    music: "music",
    systems: "systems",
    languages: "languages",
    games: "games",
  },
  noLink: "no public link yet",
  englishOnly: "",
  page: {
    label: "projects",
    title: "Projects",
    line: "What I build for myself, and what I build with clients.",
    mine: "My projects",
    lead: "Four things I am building right now. Each card has a small sketch that runs in your browser: it shows the idea, not the real project.",
    viewAll: "View all projects",
    clients: "Client work",
    clientsLead:
      "Work made with and for clients. Cases appear here once they are written up and cleared to share.",
    clientsEmpty: "No client cases published yet.",
    clientsEmptyNote: "Each one will say what was asked for and what was made.",
    caseLabel: "case",
    caseSoon: "Case coming soon",
    cta: "Have a project in mind? Write to",
  },
  all: {
    back: "Projects",
    label: "projects / all",
    title: "All projects",
    line: "A personal collection of the things I build: tools, music, languages, games and experiments.",
    heading: "Every project",
    filters: "Filter projects by kind",
    all: "all",
    count: { one: "{n} project", other: "{n} projects" },
    cta: "Something here you want to talk about? Write to",
  },
  home: {
    heading: "My projects",
    more: "More projects and client work",
  },
  art: {
    label: {
      mochifile:
        "Mochifile sketch: compressing a photo to a target size, with example values",
      ordelis:
        "Ordelis sketch: the planned review step, where you approve the agents' work or send it back",
      refrain: "Refrain sketch: a hand-drawn music journal and a record",
      orbit:
        "Orbit sketch: executions moving between states, simulated in your browser",
      yanawa:
        "yanawa sketch: a line of design syntax split into tokens and a syntax tree",
      sweep: "Sweep sketch: an example run sorting four files into folders",
      hum: "Hum sketch: the planned player, with a moving visualizer",
      morrowferry:
        "Morrowferry sketch: a ferryman and a boy in a lantern-lit boat at night",
    },
    example: "example values",
    simulated: "simulated in your browser",
    mochifile: {
      tool: "Compress an image",
      local: "in your browser",
      original: "original",
      result: "result",
      file: "photo",
      target: "target size",
      under: "under {size}",
      before: "before",
      after: "after",
    },
    ordelis: {
      note: "planned workflow · sketch",
      task: "task",
      agents: "agents",
      review: "review",
      taskTitle: "Add search to the settings page",
      plan: "plan",
      implement: "implement",
      test: "test",
      implementing: "implementing · 3 of 4",
      writingTests: "writing tests",
      revising: "revising from your notes",
      done: "done",
      another: "another agent",
      anotherNote: "joins when needed",
      files: "6 files",
      testsPassing: "tests passing",
      lintClean: "lint clean",
      openComment: "1 open comment",
      you: "you",
      waiting: "Waiting for your review.",
      approved: "Approved by you. Ready to merge.",
      returned: "Sent back with your notes.",
      approve: "Approve",
      requestChanges: "Request changes",
    },
    refrain: {
      albums: "albums",
      artists: "artists",
      memories: "memories",
      title: "track by track",
      tagline: "some songs take you back.",
      play: "play",
      stop: "stop",
      record: "the record",
    },
    orbit: {
      header: "orbit · execution states",
      queued: "queued",
      running: "running",
      succeeded: "succeeded",
      failed: "failed",
      cancelled: "cancelled",
      finished: "finished",
      queue: "Queue a job",
      cancel: "Cancel",
      idle: "Nothing queued. Queue a job.",
      full: "Six executions at once is the limit here.",
      log: "State changes",
      counts: "Executions by state",
    },
    yanawa: {
      note: "design syntax · nothing runs it yet",
      tokens: "tokens",
      tree: "syntax tree",
    },
    sweep: {
      files: ["photo.png", "report.pdf", "archive.tar.gz", "song.mp3"],
      done: "example · 4 moved · 0 skipped",
    },
    hum: {
      note: "planned interface",
      nowPlaying: "now playing",
      track: "song.flac",
      volume: "vol",
    },
  },
};

export { countLabel } from "./count-label.ts";
