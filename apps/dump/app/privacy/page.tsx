import { staticMetadata } from "@/lib/seo";
import { LegalPage } from "@raioviajante/design/templates";

import { DumpShell } from "@/components/DumpShell";

export const metadata = staticMetadata("/privacy");

export default function Privacy() {
  return (
    <DumpShell>
      <LegalPage
        site="dump"
        title="Privacy Policy"
        inShort={[
          { label: "accounts", value: "none" },
          { label: "sound preference", value: "saved in a cookie" },
          { label: "comments", value: "GitHub, via giscus" },
        ]}
        sections={[
          {
            title: "In your browser",
            body: (
              <p>
                Your sound preference is saved in a small cookie on
                .raioviajante.com, so every raioviajante site remembers it. The
                cookie is created only when you switch sound on or off, holds
                just that choice, and lasts one year. It is not used for
                tracking.
              </p>
            ),
          },
          {
            title: "On the way to the page",
            body: (
              <p>
                Like any website, the host (Vercel) receives standard request
                data — IP address, browser and the page asked for — to deliver
                it.
              </p>
            ),
          },
          {
            title: "Comments and feeds",
            body: (
              <p>
                Comments go through giscus to GitHub Discussions. They load only
                when you scroll to the comments section or ask for them; until
                then this page does not contact giscus or GitHub. Once they
                load, your browser connects to giscus.app and GitHub. Signing in
                and posting happen with GitHub, under GitHub&apos;s privacy
                policy; dump never sees your password. The RSS feed is a plain
                file — feed readers request it like any page.
              </p>
            ),
          },
        ]}
      />
    </DumpShell>
  );
}
