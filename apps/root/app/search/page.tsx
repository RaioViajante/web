import { metadataFor } from "../../lib/seo";
import { SearchPage } from "@raioviajante/design/search";
import { RootShell } from "../../components/RootShell";

export const metadata = metadataFor("/search");

export default function Page() {
  return (
    <RootShell current="/search">
      <SearchPage site="root" />
    </RootShell>
  );
}
