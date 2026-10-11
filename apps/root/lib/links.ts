import { CONTACT } from "../../../site/sites";
import { identity } from "../../../seo/structured-data";

export interface PrimaryLink {
  label: string;
  galleryLabel?: string;
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

export const socialLinks: PrimaryLink[] = [
  {
    label: "X / Twitter",
    galleryLabel: "X",
    href: "https://x.com/semrollback",
    rel: "me",
    category: "posts",
    description:
      "Daily updates on the projects I'm building. This is where I'll be most active.",
  },
  {
    label: "YouTube / @semrollback",
    galleryLabel: "YouTube",
    href: "https://www.youtube.com/@semrollback",
    rel: "me",
    category: "channel",
    description:
      "Animations and videos about programming, from concepts to things I'm building.",
  },
  {
    label: "TikTok",
    galleryLabel: "TikTok",
    href: "https://www.tiktok.com/@semrollback",
    rel: "me",
    category: "shorts",
    description: "Short animations and quick takes on programming ideas.",
  },
];

export const profileLinks: PrimaryLink[] = [github, ...socialLinks];

export const primaryLinks: PrimaryLink[] = [
  ...socialLinks,
  github,
  {
    label: CONTACT.email,
    href: `mailto:${CONTACT.email}`,
    category: "email",
    description: "Write to me about an idea, question or collaboration.",
  },
];
