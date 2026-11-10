import { CONTACT } from "../../../site/sites.ts";
import { identity } from "../../../seo/structured-data.ts";

export interface PrimaryLink {
  label: string;
  href: string;
  category: string;
  description: string;
  /** `me` marks a profile of the site owner. */
  rel?: string;
}

const github: PrimaryLink = {
  label: "GitHub",
  href: identity.github,
  rel: "me",
  category: "code",
  description: "Code, projects and experiments in progress.",
};

/** The video-code organization is not a profile of the person: no `rel="me"`. */
export const videoSourceLink: PrimaryLink = {
  label: "Video Source Code",
  href: "https://github.com/raioviajando",
  category: "source",
  description: "Source code that accompanies my programming videos.",
};

export const socialLinks: PrimaryLink[] = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/raioviajando/",
    rel: "me",
    category: "photos",
    description: "Photos and short updates from the things I'm building.",
  },
  {
    label: "X",
    href: "https://x.com/raioviajando",
    rel: "me",
    category: "posts",
    description: "Updates on the projects I'm building.",
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@raioviajando",
    rel: "me",
    category: "channel",
    description:
      "Animations and videos about programming, from concepts to things I'm building.",
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@raioviajando",
    rel: "me",
    category: "shorts",
    description: "Short animations and quick takes on programming ideas.",
  },
  {
    label: "Letterboxd",
    href: "https://letterboxd.com/raioviajando/",
    rel: "me",
    category: "films",
    description: "The films I've watched and what I thought of them.",
  },
  {
    label: "Spotify",
    href: "https://open.spotify.com/user/31mwvlvvkdfertthfcpk7zcfis7e",
    rel: "me",
    category: "music",
    description: "The music I keep coming back to.",
  },
  {
    label: "Pinterest",
    href: "https://www.pinterest.com/RaioViajando/",
    rel: "me",
    category: "references",
    description: "Visual references I like to keep around.",
  },
  {
    label: "Hugging Face",
    href: "https://huggingface.co/RaioViajando",
    rel: "me",
    category: "ai",
    description: "My profile for AI models and experiments.",
  },
  {
    label: "Kaggle",
    href: "https://www.kaggle.com/raioviajando",
    rel: "me",
    category: "data",
    description: "My profile for datasets, notebooks and competitions.",
  },
  {
    label: "Gist",
    href: "https://gist.github.com/RaioViajante",
    rel: "me",
    category: "notes",
    description: "Short notes and checklists from building things.",
  },
];

export const profileLinks: PrimaryLink[] = [
  github,
  ...socialLinks,
  videoSourceLink,
];

const personalCategories = new Set(["films", "music", "references"]);

/** The more personal networks, which use the hand-drawn picture in the gallery. */
export const personalProfileLinks = profileLinks.filter((link) =>
  personalCategories.has(link.category),
);

export const mainProfileLinks = profileLinks.filter(
  (link) => !personalCategories.has(link.category),
);

export const primaryLinks: PrimaryLink[] = [
  ...socialLinks,
  github,
  videoSourceLink,
  {
    label: CONTACT.email,
    href: `mailto:${CONTACT.email}`,
    category: "email",
    description: "Write to me about an idea, question or collaboration.",
  },
];
