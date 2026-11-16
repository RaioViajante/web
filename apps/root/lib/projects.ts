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
import type { RouteKey } from "./routes.ts";

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

export type CaseId = "stucco" | "quadra";

/** Client work and academic projects, each told as a case. Only real, published cases belong here. */
export interface Case {
  id: CaseId;
  /** The name shown publicly; both brands are the demos' fictional ones. */
  name: string;
  year: string;
  /** The page that tells the case. */
  route: RouteKey;
}

export const cases: readonly Case[] = [
  { id: "stucco", name: "Stucco.", year: "2026", route: "projects-stucco" },
  { id: "quadra", name: "Quadra", year: "2025", route: "projects-quadra" },
];

/** Every word a case card shows. */
export interface CaseText {
  scope: string;
  summary: string;
  action: string;
}

/** Every word a project card shows, per project. */
export interface ProjectText {
  /** Kind of project: the card subtitle and the catalog label. */
  meta: string;
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

/**
 * Copy of the project sketches. Code samples and product names are fixed. The
 * sketches are decorative (each card names and describes its project in
 * text), so they need no accessible names.
 */
export interface ProjectArtCopy {
  /** Visible notes that values are examples or that a sketch is simulated. */
  example: string;
  simulated: string;
  mochifile: { file: string };
  ordelis: { note: string; task: string; you: string; approve: string };
  /**
   * The words of Refrain's own card art, in its own typefaces. Every
   * character must be in `refrainFontText` (packages/design/scripts/refrain-art.mjs).
   */
  refrain: { kicker: string; tagline: string; note: string };
  orbit: { queued: string; running: string; succeeded: string };
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
  cases: Record<CaseId, CaseText>;
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
    /** The button that shows the other projects; takes {n}. */
    more: string;
    less: string;
    viewAll: string;
    cases: string;
    casesLead: string;
    caseLabel: string;
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
      description:
        "An experimental, strongly typed language for building applications. It exists as design documents; there is no compiler yet.",
      summary:
        "My own strongly typed language, for building applications. Still being designed: there is no compiler yet.",
      status: "in design",
      action: "Read the docs",
      actionShort: "the docs",
    },
    sweep: {
      meta: "CLI / Python",
      description:
        "A command-line tool in Python that sorts the files in a folder into category directories by extension.",
      summary:
        "Sorts the files in a folder into category directories. preview shows the plan without moving anything.",
      status: "active",
      action: "Read the docs",
      actionShort: "the docs",
    },
    hum: {
      meta: "music / terminal",
      description:
        "A local-first music player for the terminal, in Rust. It is being planned and specified; the player itself is not built yet.",
      summary:
        "A local-first terminal music player in Rust. Still being planned: the player is not built yet.",
      status: "planning",
      action: "Open the repository",
      actionShort: "repository",
    },
    morrowferry: {
      meta: "game / storytelling",
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
  cases: {
    stucco: {
      scope: "website + brand · concept demo",
      summary:
        "A site and brand for a plaster and drywall studio: hero slideshow, a filterable gallery of 47 projects, service pages, a quote form, business and review cards. The brand is fictional; the photos are the studio's real work.",
      action: "Read the case",
    },
    quadra: {
      scope: "academic project · product + UI · concept demo",
      summary:
        "An events and space-booking system for a university, made with Rafael as an academic project and reimagined as the fictional Quadra: a calendar of periods, requests that need approval, check-in, analytics and a public agenda.",
      action: "Read the case",
    },
  },
  noLink: "no public link yet",
  englishOnly: "",
  page: {
    label: "projects",
    title: "Projects",
    line: "What I build for myself, and what I build with clients.",
    mine: "My projects",
    lead: "What I am building right now. Four up front, the rest one click away.",
    more: "Show {n} more projects",
    less: "Show fewer projects",
    viewAll: "View all projects",
    cases: "Cases",
    casesLead: "Client work and academic projects, each written up as a case.",
    caseLabel: "case",
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
    more: "All projects, including client work",
  },
  art: {
    example: "example values",
    simulated: "simulated in your browser",
    mochifile: { file: "photo" },
    ordelis: {
      note: "planned workflow · sketch",
      task: "task",
      you: "you",
      approve: "Approve",
    },
    refrain: {
      kicker: "A MUSIC JOURNAL · KEPT BY HAND",
      tagline: "some songs take you back.",
      note: "( side A: the ones that stay )",
    },
    orbit: {
      queued: "queued",
      running: "running",
      succeeded: "succeeded",
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
