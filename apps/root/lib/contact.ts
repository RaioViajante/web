// The Contact page: every word on it. Portuguese is `ptContact` in pt.ts,
// typed by the same interface. The profiles come from links.ts and the four
// places from the About copy. This file imports types only, so a plain Node
// test can load it.

export interface ContactCopy {
  label: string;
  title: string;
  intro: string;
  status: string;
  /** The stickers' accessible names are empty: they are decoration. */
  mail: {
    label: string;
    write: string;
    copy: string;
    copied: string;
    /** Said, not shown, when the browser refuses to copy. */
    copyFailed: string;
    question: string;
    /** Shown until a subject is picked. */
    hint: string;
    subjects: readonly { title: string; hint: string }[];
    note: string;
  };
  offers: {
    heading: string;
    lead: string;
    /** Prefix of the email subject a card writes. */
    subject: string;
    action: string;
    items: readonly { title: string; description: string }[];
  };
  pitch: {
    heading: string;
    lead: string;
    items: readonly string[];
    exampleLabel: string;
    example: string;
    nextLabel: string;
    steps: readonly string[];
  };
  free: {
    heading: string;
    lead: string;
    items: readonly { title: string; description: string; subject: string }[];
  };
  elsewhere: {
    heading: string;
    social: string;
    ecosystem: string;
    feed: string;
  };
  bye: string;
  sticky: string;
}

export const contactCopy: ContactCopy = {
  label: "contact",
  title: "Hi, it's Bryan.",
  intro:
    "If you made it here, you probably have an idea, a question, or just feel like talking. Go ahead and write. A project, music, a drawing, a post on dump that made you think of something, it all counts.",
  status: "Open to new projects",
  mail: {
    label: "email",
    write: "Write an email",
    copy: "Copy address",
    copied: "Copied",
    copyFailed: "Could not copy. The address is mail@raioviajante.com.",
    question: "What do you want to talk about?",
    hint: "Pick a subject, or just write.",
    subjects: [
      {
        title: "New project",
        hint: "Tell me what it is, who it is for and when you need it.",
      },
      {
        title: "Freelance",
        hint: "Tell me about the team, what you need and for how long.",
      },
      {
        title: "Collaboration",
        hint: "Tell me the idea, even if it is still a bit loose.",
      },
      {
        title: "Music",
        hint: "Recommend me an album and tell me why it matters.",
      },
      {
        title: "Drawing",
        hint: "Send me what you draw, or what you would like me to draw.",
      },
      {
        title: "A post",
        hint: "Which post on dump? Disagreeing counts too.",
      },
      { title: "Just hi", hint: "Hi. That alone is great." },
    ],
    note: "I reply within 3 business days.",
  },
  offers: {
    heading: "Things I'm up for",
    lead: "I like doing all of it. Every project is a new adventure, and if it's something I've never done, I learn by doing it.",
    subject: "Project: ",
    action: "write about this",
    items: [
      {
        title: "Development",
        description: "Sites, apps and APIs, from prototype to deploy.",
      },
      {
        title: "Interfaces",
        description:
          "Flows, prototypes and the small details that make a difference.",
      },
      {
        title: "Design and identity",
        description: "Brands, characters and visual systems.",
      },
      {
        title: "Illustration",
        description: "Characters, stickers, covers. Usually in Procreate.",
      },
      {
        title: "Experiments",
        description: "Tools and languages that don't know what they are yet.",
      },
      {
        title: "Creative ideas",
        description:
          "Slightly odd projects and collaborations with no set shape.",
      },
    ],
  },
  pitch: {
    heading: "If you want to pitch something",
    lead: "No formal brief needed. Write it the way you would say it. These help:",
    items: [
      "What you are building, and who it is for.",
      "What you need: design, development, or both.",
      "When you would like to start, and any deadline.",
      "A budget range, if you already have one.",
      "Links to anything that exists already: a site, a file, a sketch.",
    ],
    exampleLabel: "a first message can be this simple",
    example:
      "Hi Bryan! I run a small ceramics shop and I'd like a simple site with the pieces and a way to order. I don't have a logo yet. I'd like to launch before March. The budget is tight, but we can talk. Here's the shop's Instagram: …",
    nextLabel: "What happens next",
    steps: [
      "I reply within 3 business days, sometimes with a few questions.",
      "We talk, by email or on a call, whatever is easier for you.",
      "I send a proposal with scope, timeline and price. If it makes sense for both of us, we start.",
    ],
  },
  free: {
    heading: "It doesn't have to be work",
    lead: "I also like getting messages that have nothing to do with a project.",
    items: [
      {
        title: "Music",
        description: "Recommend me an album that changed something for you.",
        subject: "An album for you",
      },
      {
        title: "Drawing",
        description: "Show me what you draw.",
        subject: "Drawing",
      },
      {
        title: "Posts",
        description: "Read something on dump and want to reply?",
        subject: "About a post on dump",
      },
      {
        title: "Anything",
        description: "A question, an idea, or just hi.",
        subject: "Hi",
      },
    ],
  },
  elsewhere: {
    heading: "Where else to find me",
    social: "Social",
    ecosystem: "The RaioViajante ecosystem",
    feed: "dump feed",
  },
  bye: "Thanks for stopping by.",
  sticky: "Write to me",
};
