import { notFoundMetadata } from "../../../seo/metadata";
import Link from "next/link";
import { NotFoundPage } from "@raioviajante/design/components";
import { RootShell } from "../components/RootShell";

export const metadata = notFoundMetadata(
  "https://raioviajante.com",
  "raioviajante",
);

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
