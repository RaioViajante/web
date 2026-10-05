export interface PrimaryLink {
  label: string;
  href: string;
  category: string;
  description: string;
}

export const primaryLinks: PrimaryLink[] = [
  {
    label: "GitHub",
    href: "https://github.com/RaioViajante",
    category: "code",
    description: "Code, projects and experiments in progress.",
  },
  {
    label: "mail@raioviajante.com",
    href: "mailto:mail@raioviajante.com",
    category: "email",
    description: "Write to me about an idea, question or collaboration.",
  },
];
