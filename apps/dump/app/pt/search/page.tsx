import { SearchPage } from "@raioviajante/design/search";

import { DumpShell } from "@/components/DumpShell";
import { routes } from "@/lib/routes";
import { staticMetadata } from "@/lib/seo";

const locale = "pt-BR" as const;
const path = routes.search[locale]!;

export const metadata = staticMetadata(path);

export default function SearchPagePt() {
  return (
    <DumpShell current={path} locale={locale}>
      <SearchPage site="dump" locale={locale} />
    </DumpShell>
  );
}
