import type { Metadata } from "next";
import { LegalPage } from "@raioviajante/design/components";
import { RootShell } from "../../components/RootShell";

export const metadata: Metadata = { title: "privacy policy" };

export default function Privacy() {
  return (
    <RootShell>
      <LegalPage
        site="root"
        title="Privacy Policy"
        lastUpdated="October 4, 2026"
        inShort={[
          { label: "accounts", value: "none" },
          { label: "email", value: "only what you send" },
          { label: "sound preference", value: "stored in your browser" },
          { label: "tracking", value: "none [CONFIRM]" },
        ]}
        sections={[
          {
            title: "Controller and contact",
            body: (
              <p>
                This website is operated under CNPJ 53.021.377/0001-93. For
                questions about your data, write to{" "}
                <a href="mailto:mail@raioviajante.com">mail@raioviajante.com</a>
                .
              </p>
            ),
          },
          {
            title: "Data and preferences",
            body: (
              <>
                <p>
                  This site has no registration form. If you email the address
                  above, we receive the information you choose to send, such as
                  your name, email address and message.
                </p>
                <p>
                  The sound switch stores your on or off preference in this
                  browser. The home page requests the public RSS feed from
                  dump.raioviajante.com on the server to display recent posts.
                </p>
              </>
            ),
          },
          {
            title: "Other sites",
            body: (
              <p>
                Links to dump, docs, lab, GitHub and other destinations open
                separate websites. Their data practices may differ from this
                root site.
              </p>
            ),
          },
          {
            title: "Your rights",
            body: (
              <p>
                You can contact us to ask about personal information provided by
                email, or to request access, correction or deletion where
                applicable. The Brazilian data protection authority explains the
                rights available under the LGPD in its{" "}
                <a href="https://www.gov.br/anpd/pt-br/assuntos/titular-de-dados-1/direito-dos-titulares">
                  guide for data subjects
                </a>
                .
              </p>
            ),
          },
          {
            title: "Updates",
            body: (
              <>
                <p>
                  This page will be updated when the site&apos;s data practices
                  change.
                </p>
                <p>Last updated: October 4, 2026.</p>
              </>
            ),
          },
        ]}
      />
    </RootShell>
  );
}
