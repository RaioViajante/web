import type { Metadata } from "next";
import { SectionHeading } from "../../components/SectionHeading";
import { lastUpdated, now, tagline } from "../../lib/now";

export const metadata: Metadata = { title: "now" };

export default function Now() {
  return (
    <>
      <div className="rv-hero">
        <p className="rv-eyebrow">now</p>
        <h1>Now</h1>
        <p className="rv-dek">{tagline}</p>
        <p className="now-updated">last updated {lastUpdated}</p>
      </div>
      {now.map((group, index) => {
        const id = `${group.category}-heading`;
        return (
          <section
            key={group.category}
            className="rv-section"
            aria-labelledby={id}
          >
            <SectionHeading
              id={id}
              number={`02.${index}`}
              title={group.category}
            />
            {group.items.map((item) => (
              <div className="now-entry" key={item.title}>
                <h3>{item.title}</h3>
                {item.description ? <p>{item.description}</p> : null}
              </div>
            ))}
          </section>
        );
      })}
    </>
  );
}
