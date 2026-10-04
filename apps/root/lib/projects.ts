export interface Project {
  name: string;
  description: string;
  stack: string;
  year: string;
  status: string;
  href: string;
}

export const projects: Project[] = [
  {
    name: "Hum",
    description: "terminal music player",
    stack: "rust",
    year: "2026",
    status: "exploring",
    href: "https://github.com/RaioViajante/hum",
  },
  {
    name: "Sweep",
    description: "personal file organizer and automation tool",
    stack: "python",
    year: "2026",
    status: "active",
    href: "https://github.com/RaioViajante/sweep",
  },
  {
    name: "Orbit",
    description:
      "job execution backend built to go deeper into Java and Spring",
    stack: "java / spring",
    year: "2026",
    status: "active",
    href: "https://github.com/RaioViajante/orbit",
  },
  {
    name: "Yanawa",
    description:
      "an application-oriented programming language in the design phase",
    stack: "language design",
    year: "2026",
    status: "exploring",
    href: "https://github.com/yanawa/yanawa",
  },
  {
    name: "Dump",
    description: "technical writing, notes and things learned the hard way",
    stack: "next.js / mdx",
    year: "2026",
    status: "active",
    href: "https://dump.raioviajante.com",
  },
];
