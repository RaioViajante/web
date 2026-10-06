import { notFoundMetadata } from "@raioviajante/design/seo";
import Link from "next/link";
import { NotFoundPage } from "@raioviajante/design/templates";

import { DumpShell } from "@/components/DumpShell";

export default function NotFound() {
  return (
    <DumpShell>
      <NotFoundPage
        site="dump"
        linkComponent={Link}
        line="this page moved, never existed, or I haven't written it yet."
        tryInstead={[
          { label: "dump", value: "start over", href: "/" },
          { label: "archive", value: "everything", href: "/archive" },
          { label: "tags", value: "topics", href: "/tags" },
          {
            label: "raioviajante.com",
            value: "home",
            href: "https://raioviajante.com",
          },
        ]}
      />
    </DumpShell>
  );
}

export const metadata = notFoundMetadata(
  "https://dump.raioviajante.com",
  "dump",
);
