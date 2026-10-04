import type { Metadata } from "next";
import { LeaderRow } from "../../components/LeaderRow";
import { SectionHeading } from "../../components/SectionHeading";
import { gear } from "../../lib/setup";

export const metadata: Metadata = { title: "setup" };

export default function Setup() {
  return (
    <>
      <div className="rv-hero">
        <p className="rv-eyebrow">setup</p>
        <h1>Setup</h1>
        <p className="rv-dek">The tools I use at my desk and on the road.</p>
      </div>
      <section className="rv-section" aria-labelledby="gear-heading">
        <SectionHeading id="gear-heading" number="00.1" title="Gear list" />
        {gear.length === 0 ? (
          <p className="setup-empty">I&apos;m putting the list together.</p>
        ) : (
          gear.map((item) => (
            <LeaderRow
              key={item.name}
              name={item.url ? <a href={item.url}>{item.name}</a> : item.name}
              note={item.category}
            />
          ))
        )}
      </section>
    </>
  );
}
