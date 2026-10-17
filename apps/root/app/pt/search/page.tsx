import { SearchPage } from "@raioviajante/design/search";
import { RootShell } from "../../../components/RootShell";
import { metadataFor } from "../../../lib/seo";
import { routes } from "../../../lib/routes";

const path = routes.search["pt-BR"]!;
export const metadata = metadataFor(path);

export default function Page() {
  return (
    <RootShell current={path} locale="pt-BR">
      <SearchPage site="root" locale="pt-BR" />
    </RootShell>
  );
}
