import { staticMetadata } from "@/lib/seo";
import { SearchPage } from "@raioviajante/design/search";

import { DumpShell } from "@/components/DumpShell";

export const metadata = staticMetadata("/search");

export default function Page() {
  return (
    <DumpShell current="/search">
      <SearchPage site="dump" />
    </DumpShell>
  );
}
