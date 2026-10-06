import { LegalPage } from "@raioviajante/design/templates";
import { Pager } from "@raioviajante/design/parts";
export function TermsPage() {
  return (
    <>
      <LegalPage
        site="lab"
        title="Terms of Use"
        inShort={[
          { label: "reading", value: "free" },
          { label: "code", value: "license of each repository" },
          { label: "warranty", value: "none — things may break" },
        ]}
        sections={[
          {
            title: "Who runs this",
            body: (
              <p>
                lab.raioviajante.com is run by RaioViajante, CNPJ
                53.021.377/0001-93, as part of raioviajante.com. Questions go to{" "}
                <a href="mailto:mail@raioviajante.com">mail@raioviajante.com</a>
                .
              </p>
            ),
          },
          {
            title: "Code",
            body: (
              <p>
                Code shown here follows the license of the repository it comes
                from. Source revisions are identified on each experiment.
              </p>
            ),
          },
          {
            title: "Experiments",
            body: (
              <p>
                Experiments are prototypes. They can be incomplete, wrong or
                broken, and each one states its fidelity: runs here, simulated,
                or source only. Do not rely on a lab result for anything that
                matters.
              </p>
            ),
          },
          {
            title: "No warranty",
            body: (
              <p>
                Everything is provided as is, without guarantees of accuracy,
                availability or fitness for a purpose. Links to other sites are
                not endorsements.
              </p>
            ),
          },
        ]}
      />
      <Pager
        prev={{ label: "← Back", title: "lab", href: "/" }}
        next={{ label: "Also →", title: "Privacy Policy", href: "/privacy/" }}
      />
    </>
  );
}
export function PrivacyPage() {
  return (
    <>
      <LegalPage
        site="lab"
        title="Privacy Policy"
        inShort={[
          { label: "accounts", value: "none" },
          { label: "stored in your browser", value: "sound preference" },
          { label: "experiment input", value: "stays in this page" },
        ]}
        sections={[
          {
            title: "In your browser",
            body: (
              <p>
                Your sound preference is saved in a small cookie on
                .raioviajante.com so the sites share it. Experiment inputs and
                results live in page memory and disappear when you reload. No
                experiment sends your input to a server.
              </p>
            ),
          },
          {
            title: "On the way to the page",
            body: (
              <p>
                Vercel hosts this site and receives standard request data to
                deliver pages, including the IP address, browser and requested
                page. Fonts are served with the site.
              </p>
            ),
          },
          {
            title: "Search",
            body: (
              <p>
                Search runs in your browser. The everywhere scope downloads
                public search indexes from the other RaioViajante sites; your
                query is filtered locally.
              </p>
            ),
          },
          {
            title: "Contact",
            body: (
              <p>
                Questions about data on this site can be sent to{" "}
                <a href="mailto:mail@raioviajante.com">mail@raioviajante.com</a>
                .
              </p>
            ),
          },
        ]}
      />
      <Pager
        prev={{ label: "← Back", title: "lab", href: "/" }}
        next={{ label: "Also →", title: "Terms of Use", href: "/terms/" }}
      />
    </>
  );
}
