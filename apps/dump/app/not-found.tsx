import { headers } from "next/headers";
import Link from "next/link";
import { NotFoundPage } from "@raioviajante/design/templates";

import { notFoundMetadata } from "../../../seo/metadata";
import {
  DEFAULT_LOCALE,
  isLocaleId,
  type LocaleId,
} from "../../../site/locales";
import { DumpShell } from "@/components/DumpShell";
import { dumpCopy } from "@/lib/copy";

async function localeOfRequest(): Promise<LocaleId> {
  const stated = (await headers()).get("x-locale");
  return isLocaleId(stated) ? stated : DEFAULT_LOCALE;
}

export async function generateMetadata() {
  const locale = await localeOfRequest();
  return notFoundMetadata(
    "https://dump.raioviajante.com",
    "dump",
    locale,
    dumpCopy(locale).notFound.metadata,
  );
}

export default async function NotFound() {
  const locale = await localeOfRequest();
  const copy = dumpCopy(locale).notFound;
  return (
    <DumpShell locale={locale}>
      <NotFoundPage
        site="dump"
        locale={locale}
        linkComponent={Link}
        line={copy.line}
        tryInstead={[...copy.tryInstead]}
      />
    </DumpShell>
  );
}
