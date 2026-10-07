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

export const primaryLinks: PrimaryLink[] = [
  {
    label: "GitHub",
    href: identity.github,
    rel: "me",
    category: "code",
    description: "Code, projects and experiments in progress.",
  },
  {
    label: CONTACT.email,
    href: `mailto:${CONTACT.email}`,
    category: "email",
    description: "Write to me about an idea, question or collaboration.",
  },
];
