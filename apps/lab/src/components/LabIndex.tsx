import { AvatarCoin } from "@raioviajante/design/avatar-coin";
import { IndexHeader, Section, LeaderRow } from "@raioviajante/design/parts";
import { ToggleButton } from "@raioviajante/design/components";
import { experimentsFor, experimentPath } from "../data/experiments";
import { experimentCount } from "../lib/experiment-count";
import { displayDate, textFor } from "../lib/copy";
import type { LocaleId } from "../../../../site/locales";

export function LabIndex({ locale = "en" }: { locale?: LocaleId }) {
  const experiments = experimentsFor(locale);
  const text = textFor(locale);
  return (
    <>
      <IndexHeader
        name="lab"
        line={text.tagline}
        avatar={
          <AvatarCoin
            label={text.avatar.label}
            reducedMotionLabel={text.avatar.reduced}
          />
        }
      />
      <Section
        number="00."
        title={text.experiments}
        id="experiments"
        headingExtra={
          <div
            className="lab-filters"
            role="group"
            aria-label={
              locale === "en" ? "Filter experiments" : "Filtrar experimentos"
            }
          >
            {["all", "active", "done"].map((filter) => (
              <ToggleButton
                key={filter}
                pressed={filter === "all"}
                data-filter={filter}
              >
                {text.filters[filter as keyof typeof text.filters]}
              </ToggleButton>
            ))}
          </div>
        }
      >
        <div
          data-experiment-list
          data-count-copy={JSON.stringify({
            one: text.count(1),
            many: text.count(2).replace(/^2 /, ""),
          })}
        >
          {experiments.map((e) => (
            <article key={e.id} className="lab-entry" data-status={e.status}>
              <LeaderRow
                href={experimentPath(e)}
                label={
                  <>
                    <span className="lab-id">{e.id}</span>
                    {e.title}
                  </>
                }
                value={text.status[e.status]}
              />
              <p>{e.description}</p>
              <div className="lab-entry__meta">
                {e.project} · {text.fidelityLabel[e.fidelity]} ·{" "}
                {displayDate(e)}
              </div>
            </article>
          ))}
        </div>
        <p
          className="rv-sr-only"
          role="status"
          aria-live="polite"
          data-filter-result
        >
          {locale === "en"
            ? experimentCount(experiments.length)
            : text.count(experiments.length)}
        </p>
      </Section>
      <Section number="00.1" title={text.whatRuns}>
        <LeaderRow
          label={text.fidelityLabel["runs here"]}
          value={text.fidelityHelp[0]}
        />
        <LeaderRow
          label={text.fidelityLabel.simulated}
          value={text.fidelityHelp[1]}
        />
        <LeaderRow
          label={text.fidelityLabel["source only"]}
          value={text.fidelityHelp[2]}
        />
      </Section>
      <Section number="00.2" title={text.notebook} id="notebook">
        <p>{text.notebookIntro}</p>
        {experiments.map((e) => (
          <LeaderRow
            key={e.id}
            href={experimentPath(e)}
            label={
              <>
                <span className="lab-date">{displayDate(e)}</span>
                {e.title} {text.published}
              </>
            }
            value={e.id}
          />
        ))}
      </Section>
    </>
  );
}
