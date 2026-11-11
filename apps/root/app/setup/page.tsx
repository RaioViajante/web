import { metadataFor } from "../../lib/seo";
import {
  LeaderRow,
  PageHeader,
  Section,
  SiteLink,
} from "@raioviajante/design/components";
import { RootShell } from "../../components/RootShell";
import { affiliateDisclosure, gear } from "../../lib/setup";

const path = "/setup";
export const metadata = metadataFor(path);

export default function Setup() {
  return (
    <RootShell current={path}>
      <PageHeader
        label="setup"
        title="Setup"
        line="The tools I use at my desk and on the road."
      />
      <Section number="00.1" title="Gear list" id="gear-heading">
        {gear.some((item) => item.url) && (
          <p className="setup-disclosure" id="affiliate-disclosure">
            {affiliateDisclosure}
          </p>
        )}
        {gear.length === 0 ? (
          <p className="setup-empty">I&apos;m putting the list together.</p>
        ) : (
          gear.map((item) => (
            <div className="setup-gear" key={item.name}>
              <LeaderRow label={item.name} value={item.category} />
              <p className="setup-gear__link">
                {item.url ? (
                  <>
                    <strong>Link:</strong>{" "}
                    <SiteLink href={item.url} rel="sponsored" newTab="en">
                      {item.url.replace(/^https:\/\//, "")}
                    </SiteLink>
                  </>
                ) : (
                  "No trusted link available."
                )}
              </p>
            </div>
          ))
        )}
      </Section>
    </RootShell>
  );
}
