import type { Metadata } from "next";
import { LegalPage } from "@raioviajante/design/components";
import { RootShell } from "../../components/RootShell";

export const metadata: Metadata = { title: "terms of use" };

export default function Terms() {
  return (
    <RootShell>
      <LegalPage
        site="root"
        title="Terms of Use"
        lastUpdated="October 4, 2026"
        inShort={[
          { label: "accounts", value: "none" },
          { label: "purchases", value: "none" },
          {
            label: "text and artwork",
            value: "[LICENSE OR ALL RIGHTS RESERVED]",
          },
          { label: "code", value: "license of each repository" },
        ]}
        sections={[
          {
            title: "Scope",
            body: (
              <p>
                These terms describe the use of raioviajante.com, a personal
                site that presents projects, writing and links to other
                destinations. The site does not offer accounts or purchases.
              </p>
            ),
          },
          {
            title: "Using the site",
            body: (
              <p>
                You are welcome to read and share links to the public pages.
                Please do not interfere with the site, attempt unauthorized
                access or use it in ways that harm others.
              </p>
            ),
          },
          {
            title: "Content and code",
            body: (
              <p>
                Project descriptions and other content may change as the work
                evolves. Some projects link to public source repositories. Check
                the license in each repository before reusing its code; a public
                link alone does not describe reuse permissions for the
                site&apos;s text or artwork.
              </p>
            ),
          },
          {
            title: "External destinations",
            body: (
              <p>
                Dump, docs, lab, GitHub and other linked destinations are
                separate websites. Review their own information when you visit
                them. Our <a href="/privacy">Privacy Policy</a> describes data
                handling on this root site.
              </p>
            ),
          },
          {
            title: "Contact and updates",
            body: (
              <>
                <p>
                  Questions about this site or these terms can be sent to{" "}
                  <a href="mailto:mail@raioviajante.com">
                    mail@raioviajante.com
                  </a>
                  . The current version of these terms will remain available on
                  this page when updated.
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
