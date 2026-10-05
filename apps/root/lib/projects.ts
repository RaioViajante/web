export interface Project {
  name: string;
  description: string;
  kind: string;
  stack: string;
  year: string;
  status: string;
  href: string;
}

export const projects: Project[] = [
  {
    name: "Hum",
    description:
      "A terminal music player built in Rust. An exploration of what a focused music interface can feel like without leaving the command line.",
    kind: "software / music",
    stack: "rust",
    year: "2026",
    status: "exploring",
    href: "https://github.com/RaioViajante/hum",
  },
  {
    name: "Sweep",
    description:
      "A Python tool for organizing personal files with predictable rules. I'm working through configuration and safety boundaries before giving the tool more autonomy over the filesystem.",
    kind: "tool / automation",
    stack: "python",
    year: "2026",
    status: "active",
    href: "https://github.com/RaioViajante/sweep",
  },
  {
    name: "Orbit",
    description:
      "A job-execution backend built with Java and Spring. It currently models jobs, executions and valid state transitions; scheduling and process execution are still ahead.",
    kind: "backend / job execution",
    stack: "java / spring",
    year: "2026",
    status: "active",
    href: "https://github.com/RaioViajante/orbit",
  },
  {
    name: "Yanawa",
    description:
      "An application-oriented programming language in the design phase. The current work is defining its shape and behavior before implementing the compiler.",
    kind: "language design",
    stack: "language design",
    year: "2026",
    status: "exploring",
    href: "https://github.com/yanawa/yanawa",
  },
  {
    name: "Dump",
    description: "technical writing, notes and things learned the hard way",
    kind: "writing / technical notes",
    stack: "next.js / mdx",
    year: "2026",
    status: "active",
    href: "https://dump.raioviajante.com",
  },
];
