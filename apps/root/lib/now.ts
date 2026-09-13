type NowItem = {
  title: string;
  description?: string;
};

type NowGroup = {
  category: string;
  items: NowItem[];
};

export const lastUpdated = "2026-09-13";

export const tagline = "a snapshot of what currently has my attention.";

export const now: NowGroup[] = [
  {
    category: "building",
    items: [
      {
        title: "sweep",
        description:
          "making file organization predictable before making it ambitious",
      },
      {
        title: "orbit",
        description:
          "building the execution model before the scheduler starts scheduling",
      },
      {
        title: "yanawa",
        description: "defining the language before starting the compiler",
      },
    ],
  },
  {
    category: "learning",
    items: [
      {
        title: "java / spring",
        description: "going deeper into the Java ecosystem",
      },
      {
        title: "python",
        description:
          "building small tools instead of only studying the language",
      },
      {
        title: "operating systems",
        description: "following the low-level rabbit hole",
      },
    ],
  },
  {
    category: "exploring",
    items: [
      { title: "developer tooling" },
      { title: "automation" },
      { title: "systems programming" },
      { title: "language design" },
    ],
  },
];
