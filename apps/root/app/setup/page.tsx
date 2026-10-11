import { metadataFor } from "../../lib/seo";
import {
  LeaderRow,
  PageHeader,
  Section,
} from "@raioviajante/design/components";
import { RootShell } from "../../components/RootShell";
import { gear } from "../../lib/setup";

export const metadata = metadataFor("/setup");

export default function Setup() {
  return (
    <RootShell>
      <PageHeader
        label="setup"
        title="Setup"
        line="The tools I use at my desk and on the road."
      />
      <Section number="00.1" title="Gear list" id="gear-heading">
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
                    <a href={item.url} rel="sponsored">
                      {item.url.replace(/^https:\/\//, "")}
                    </a>
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
