import { SearchPage } from "@raioviajante/design/search";

import { DumpShell } from "@/components/DumpShell";

export const metadata = { title: "Search" };

export default function Page() {
  return (
    <DumpShell current="/search">
      <SearchPage site="dump" />
    </DumpShell>
  );
}
