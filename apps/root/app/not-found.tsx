import { headers } from "next/headers";
import Link from "next/link";
import { notFoundMetadata } from "../../../seo/metadata";
import {
  DEFAULT_LOCALE,
  isLocaleId,
  type LocaleId,
} from "../../../site/locales";
import { NotFoundPage } from "@raioviajante/design/components";
import { RootShell } from "../components/RootShell";
import { ptNotFound } from "../lib/pt";

/** The locale of the missing URL, from the proxy (which derives it from the path). */
async function localeOfRequest(): Promise<LocaleId> {
  const stated = (await headers()).get("x-locale");
  return isLocaleId(stated) ? stated : DEFAULT_LOCALE;
}

export async function generateMetadata() {
  const locale = await localeOfRequest();
  return notFoundMetadata(
    "https://raioviajante.com",
    "raioviajante",
    locale,
    locale === DEFAULT_LOCALE ? undefined : ptNotFound.metadata,
  );
}

// Every miss, in either tree, is answered here: a real 404 whose server-rendered
// copy and <html lang> match the language of the URL (docs/i18n.md, "404
// behavior"). Segment-level notFound() is not used: in Next.js 16 it yields a
// generic error document without lang.
export default async function NotFound() {
  const locale = await localeOfRequest();
  const portuguese = locale !== DEFAULT_LOCALE;
  return (
    <RootShell locale={locale}>
      <NotFoundPage
        site="root"
        locale={locale}
        linkComponent={Link}
        line={
          portuguese
            ? ptNotFound.line
            : "this page moved, never existed, or I haven't built it yet."
        }
        tryInstead={
          portuguese
            ? ptNotFound.tryInstead
            : [
                { label: "raioviajante.com", value: "start over", href: "/" },
                {
                  label: "dump",
                  value: "writing",
                  href: "https://dump.raioviajante.com",
                },
                {
                  label: "docs",
                  value: "documentation",
                  href: "https://docs.raioviajante.com",
                },
                {
                  label: "lab",
                  value: "experiments",
                  href: "https://lab.raioviajante.com",
                },
              ]
        }
      />
    </RootShell>
  );
}
