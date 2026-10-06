import { SearchPage } from "@raioviajante/design/search";
import { RootShell } from "../../components/RootShell";

export const metadata = { title: "Search" };

export default function Page() {
  return (
    <RootShell current="/search">
      <SearchPage site="root" />
    </RootShell>
  );
}
