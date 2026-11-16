// The About page: every word on it. Portuguese is `ptAbout` in pt.ts, typed
// by the same interface. The text about Bryan is his own. The projects under
// "Right now" take their status from the projects copy, so it never disagrees
// with the projects pages. This file imports types only, so a plain Node test
// can load it.

import type { ProjectId } from "./projects.ts";

/** A row that links within Root, to a sister site, or nowhere. */
export interface AboutRow {
  name: string;
  note: string;
  /** A Root page, Refrain's card, or a sister site's home. */
  to?: "gallery" | "lab" | "dump" | "refrain";
}

/** A Dump post in this language: its title and its path on Dump. */
export interface AboutPost {
  title: string;
  note: string;
  path: string;
}

export interface AboutCopy {
  label: string;
  title: string;
  line: string;
  /** The avatar's accessible name. */
  avatarLabel: string;
  who: { heading: string; paragraphs: readonly string[] };
  work: { heading: string; lead: string; rows: readonly AboutRow[] };
  writing: { heading: string; lead: string; posts: readonly AboutPost[] };
  places: {
    heading: string;
    lead: string;
    notes: { root: string; dump: string; docs: string; lab: string };
  };
  now: { heading: string; projects: readonly ProjectId[] };
  tools: {
    heading: string;
    lead: string;
    groups: readonly { name: string; items: readonly string[] }[];
    setupQuestion: string;
    setupLink: string;
  };
  away: {
    heading: string;
    paragraphs: readonly string[];
    rows: readonly AboutRow[];
  };
  invite: { heading: string; line: string; action: string };
  /** Appended to a link whose destination exists only in English. */
  englishNote: string;
}

/** The projects under "Right now", in the projects pages' order. */
export const aboutNow: readonly ProjectId[] = [
  "mochifile",
  "ordelis",
  "refrain",
  "orbit",
  "yanawa",
  "sweep",
  "hum",
];

/** Tool names are not translated; only the group names are. */
export const toolGroups: readonly (readonly string[])[] = [
  ["TypeScript", "Java", "Python", "JavaScript", "SQL"],
  ["React", "Next.js", "Angular", "Astro", "Tailwind CSS"],
  ["Spring Boot", "Node.js", "NestJS", "JPA", "Hibernate"],
  ["PostgreSQL", "MySQL", "SQLite", "Flyway"],
  ["Vitest", "JUnit", "pytest", "Playwright", "Testcontainers"],
  ["Git", "GitHub", "GitHub Actions"],
  ["Docker", "Docker Compose", "Vercel", "Cloudflare Workers", "AWS", "Nginx"],
  ["VS Code", "Neovim", "IntelliJ IDEA", "iTerm2", "Homebrew", "pnpm", "uv"],
  ["ChatGPT", "Claude Code", "Codex", "Kimi", "OpenCode"],
  ["Claude Design", "Procreate", "Krita", "Blender", "Freeform"],
  ["Notion", "Goodnotes", "Apple Notes"],
  [
    "Pinterest",
    "Are.na",
    "Cosmos",
    "Savee",
    "Behance",
    "Dribbble",
    "Awwwards",
    "SiteInspire",
    "Mobbin",
  ],
  ["OBS Studio", "Audacity", "Kling AI"],
  ["macOS", "iPadOS"],
];

/** The tool groups under their names in one language. */
export const toolsUnder = (names: readonly string[]) =>
  names.map((name, index) => ({ name, items: toolGroups[index]! }));

export const aboutCopy: AboutCopy = {
  label: "about",
  title: "About",
  line: "curious enough to build it myself.",
  avatarLabel: "Flip RaioViajante avatar",
  who: {
    heading: "Who I am",
    paragraphs: [
      "I'm Bryan. Online, I'm also RaioViajante, my alter ego and a way of bringing to life the things that go through my head.",
      "I like making things. I code, draw, write and start projects without always knowing where they will end up. I'm too curious to stick to just one thing, and a lot of what I do starts simply because I felt like trying.",
      "Not everything I do needs a purpose. Some things exist because I found them beautiful, others because I wanted to learn, and some because I needed to put a feeling somewhere.",
      "This site is a bit of all of that. A place to keep my ideas, projects, drawings, thoughts and everything else I find along the way. I'm still figuring out a lot, and I probably always will be.",
    ],
  },
  work: {
    heading: "What I do",
    lead: "I like turning ideas into things that exist, even when I start without knowing exactly how.",
    rows: [
      { name: "Interface design", note: "ideas, prototypes, experiences" },
      { name: "Front end", note: "sites, interactions, small details" },
      { name: "Back end", note: "APIs, data, business rules" },
      {
        name: "Drawing and identity",
        note: "characters, illustrations, stickers",
        to: "gallery",
      },
      {
        name: "Experiments",
        note: "tools, languages, unfinished ideas",
        to: "lab",
      },
      { name: "Writing", note: "discoveries, thoughts, notes", to: "dump" },
    ],
  },
  writing: {
    heading: "Things I wrote about learning",
    lead: "From dump, where I write down what I discover while building.",
    posts: [
      {
        title: "There Is No printf Down Here",
        note: "osdev",
        path: "/posts/there-is-no-printf-down-here",
      },
      {
        title: "I Started Designing a Language Before I Could Compile One",
        note: "compilers",
        path: "/posts/started-designing-a-language-before-i-could-compile-one",
      },
      {
        title: "My Project Cards Were Getting Ahead of My Projects",
        note: "honesty",
        path: "/posts/my-project-cards-were-getting-ahead-of-my-projects",
      },
    ],
  },
  places: {
    heading: "Four places",
    lead: "My personal site was trying to be a home page, a notebook, a documentation site and an experiment lab at the same time, so I split it.",
    notes: {
      root: "home and projects",
      dump: "notebook",
      docs: "documentation",
      lab: "experiments",
    },
  },
  now: { heading: "Right now", projects: aboutNow },
  tools: {
    heading: "Tools",
    lead: "The tools I use to code, draw, write, experiment and organize my ideas. Some are part of my day to day; others show up when a project needs them.",
    groups: toolsUnder([
      "Languages",
      "Front end",
      "Back end",
      "Databases",
      "Tests",
      "Code and CI",
      "Infra and deploy",
      "Editors and terminal",
      "AI and agents",
      "Design and drawing",
      "Ideas and notes",
      "Inspiration",
      "Video and animation",
      "Systems",
    ]),
    setupQuestion: "Curious about the rest of my setup?",
    setupLink: "See the setup",
  },
  away: {
    heading: "Away from the screen",
    paragraphs: [
      "Away from code, I like playing guitar, reading and watching films that stay in my head for days.",
      "And I really like music. The kind you listen to alone, come back to years later and realize something has changed. There are albums that mean a lot to me, even when I can't explain exactly why. That is where Refrain came from: a place to keep those albums and what they remind me of.",
      "I also draw, usually for no reason but wanting to. Some of it ended up in the gallery.",
    ],
    rows: [
      { name: "Refrain", note: "music journal", to: "refrain" },
      { name: "Gallery", note: "drawings and characters", to: "gallery" },
    ],
  },
  invite: {
    heading: "Have a project in mind?",
    line: "Tell me what you are building.",
    action: "Get in touch",
  },
  englishNote: "",
};
