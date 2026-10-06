import type { Metadata } from "next";
import Link from "next/link";
import { NotFoundPage } from "@raioviajante/design/components";
import { RootShell } from "../components/RootShell";

export const metadata: Metadata = { title: "404 — not found" };

export default function NotFound() {
  return (
    <RootShell>
      <NotFoundPage
        site="root"
        linkComponent={Link}
        line="this page moved, never existed, or I haven't built it yet."
        tryInstead={[
          { label: "raioviajante.com", value: "start over", href: "/" },
          {
            label: "dump",
            value: "writing",
            href: "https://dump.raioviajante.com",
          },
          {
            label: "docs",
            value: "documentation",
            href: "https://docs.raioviajante.com",
          },
          {
            label: "lab",
            value: "experiments",
            href: "https://lab.raioviajante.com",
          },
        ]}
      />
    </RootShell>
  );
}
