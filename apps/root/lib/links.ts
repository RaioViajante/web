import { CONTACT } from "../../../site/sites";
import { identity } from "../../../seo/structured-data";

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

export const socialLinks: PrimaryLink[] = [
  {
    label: "X / Twitter",
    href: "https://x.com/semrollback",
    rel: "me",
    category: "posts",
    description:
      "Daily updates on what I'm working on. Probably my most active profile.",
  },
  {
    label: "YouTube / @semrollback",
    href: "https://www.youtube.com/@semrollback",
    rel: "me",
    category: "channel",
    description: "Animations and videos about programming.",
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@semrollback",
    rel: "me",
    category: "shorts",
    description: "Animations and quick takes on programming.",
  },
];

export const profileLinks: PrimaryLink[] = [github, ...socialLinks];

export const primaryLinks: PrimaryLink[] = [
  github,
  {
    label: CONTACT.email,
    href: `mailto:${CONTACT.email}`,
    category: "email",
    description: "Write to me about an idea, question or collaboration.",
  },
  ...socialLinks,
];
