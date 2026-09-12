type NowItem = {
  title: string;
  description?: string;
};

type NowGroup = {
  category: string;
  items: NowItem[];
};

export const lastUpdated = "2026-09-12";

export const tagline = "a snapshot of what currently has my attention.";

export const now: NowGroup[] = [
  {
    category: "building",
    items: [
      {
        title: "sweep",
        description: "making my filesystem organize itself",
      },
      {
        title: "orbit",
        description: "going deeper into Java and Spring",
      },
      {
        title: "hum",
        description: "slowly building a terminal music player",
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
        title: "angular",
        description: "getting comfortable on the other side of the stack",
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
    ],
  },
];
