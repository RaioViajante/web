import { staticMetadata } from "@/lib/seo";
import Link from "next/link";
import { LegalPage } from "@raioviajante/design/templates";

import { DumpShell } from "@/components/DumpShell";

export const metadata = staticMetadata("/terms");

export default function Terms() {
  return (
    <DumpShell>
      <LegalPage
        site="dump"
        title="Terms of Use"
        inShort={[
          { label: "reading", value: "free" },
          { label: "text and artwork", value: "all rights reserved" },
          { label: "code", value: "license of each repository" },
          { label: "warranty", value: "none — things may break" },
        ]}
        sections={[
          {
            title: "Who runs this",
            body: (
              <p>
                dump.raioviajante.com is run by RaioViajante, CNPJ
                53.021.377/0001-93, as part of raioviajante.com. Questions go to{" "}
                <a href="mailto:mail@raioviajante.com">mail@raioviajante.com</a>
                .
              </p>
            ),
          },
          {
            title: "Text and artwork",
            body: (
              <p>
                Posts, documentation and illustrations belong to RaioViajante
                unless a page says otherwise. They are all rights reserved, not
                covered by the repository&apos;s MIT license, which applies only
                to the source code.
              </p>
            ),
          },
          {
            title: "Code",
            body: (
              <p>
                Code shown here follows the license of the repository it comes
                from.
              </p>
            ),
          },
          {
            title: "Comments",
            body: (
              <p>
                Comments are hosted by GitHub Discussions through giscus. You
                need a GitHub account to comment, GitHub&apos;s own terms apply,
                and you are responsible for what you post. Spam, abuse and
                off-topic comments may be hidden or removed. See the{" "}
                <Link href="/privacy">Privacy Policy</Link> for what is stored.
              </p>
            ),
          },
        ]}
      />
    </DumpShell>
  );
}
