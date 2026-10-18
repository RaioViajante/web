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
import { ptCopy } from "@/lib/pt";

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
    locale === DEFAULT_LOCALE ? undefined : ptCopy.notFound.metadata,
  );
}

export default async function NotFound() {
  const locale = await localeOfRequest();
  const portuguese = locale === "pt-BR";
  return (
    <DumpShell locale={locale}>
      <NotFoundPage
        site="dump"
        locale={locale}
        linkComponent={Link}
        line={
          portuguese
            ? ptCopy.notFound.line
            : "this page moved, never existed, or I haven't written it yet."
        }
        tryInstead={
          portuguese
            ? [...ptCopy.notFound.tryInstead]
            : [
                { label: "dump", value: "start over", href: "/" },
                { label: "archive", value: "everything", href: "/archive" },
                { label: "tags", value: "topics", href: "/tags" },
                {
                  label: "raioviajante.com",
                  value: "home",
                  href: "https://raioviajante.com",
                },
              ]
        }
      />
    </DumpShell>
  );
}
