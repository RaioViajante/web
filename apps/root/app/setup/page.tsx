import type { Metadata } from "next";
import {
  LeaderRow,
  PageHeader,
  Section,
} from "@raioviajante/design/components";
import { RootShell } from "../../components/RootShell";
import { gear } from "../../lib/setup";

export const metadata: Metadata = { title: "setup" };

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
            <LeaderRow
              key={item.name}
              label={item.name}
              value={item.category}
              href={item.url}
            />
          ))
        )}
      </Section>
    </RootShell>
  );
}
