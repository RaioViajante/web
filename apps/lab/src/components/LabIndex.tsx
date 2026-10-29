import { AvatarCoin } from "@raioviajante/design/avatar-coin";
import { IndexHeader, Section, LeaderRow } from "@raioviajante/design/parts";
import { ToggleButton } from "@raioviajante/design/components";
import { experimentsFor, experimentPath } from "../data/experiments";
import { experimentCount, experimentForms } from "../lib/experiment-count";
import { displayDate, textFor } from "../lib/copy";
import type { LocaleId } from "../../../../site/locales";

const filters = ["all", "active", "done"] as const;

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
        title={text.headings.experiments}
        id="experiments"
        headingExtra={
          <div
            className="lab-filters"
            role="group"
            aria-label={text.filters.aria}
          >
            {filters.map((filter) => (
              <ToggleButton
                key={filter}
                pressed={filter === "all"}
                data-filter={filter}
              >
                {text.filters[filter]}
              </ToggleButton>
            ))}
          </div>
        }
      >
        <div
          data-experiment-list
          data-locale={locale}
          data-count-copy={JSON.stringify(experimentForms(locale))}
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
                <time dateTime={e.created}>{displayDate(e)}</time>
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
          {experimentCount(locale, experiments.length)}
        </p>
      </Section>
      <Section number="00.1" title={text.headings.whatRuns}>
        {(["runs here", "simulated", "source only"] as const).map(
          (fidelity) => (
            <LeaderRow
              key={fidelity}
              label={text.fidelityLabel[fidelity]}
              value={text.fidelityHelp[fidelity]}
            />
          ),
        )}
      </Section>
      <Section number="00.2" title={text.headings.notebook} id="notebook">
        <p>{text.notebookIntro}</p>
        {experiments.map((e) => (
          <LeaderRow
            key={e.id}
            href={experimentPath(e)}
            label={
              <>
                <span className="lab-date">
                  <time dateTime={e.created}>{displayDate(e)}</time>
                </span>
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
