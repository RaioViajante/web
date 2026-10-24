import { SearchPage } from "@raioviajante/design/search";
import { RootShell } from "../../../components/RootShell";
import { metadataFor } from "../../../lib/seo";
import { routes } from "../../../lib/routes";

const path = routes.search["pt-BR"]!;
export const metadata = metadataFor(path);

// The default suggestions are English words that match nothing in the
// Portuguese indexes. Each term here finds a published Portuguese entry:
// Root pages for this site, and one entry per other host for everywhere.
const suggestions = {
  site: ["sobre", "projetos", "galeria", "setup"],
  everywhere: ["traduzir", "classificação", "classificador"],
};

export default function Page() {
  return (
    <RootShell current={path} locale="pt-BR">
      <SearchPage site="root" locale="pt-BR" suggestions={suggestions} />
    </RootShell>
  );
}
