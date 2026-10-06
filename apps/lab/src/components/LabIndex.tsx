import { AvatarCoin } from "@raioviajante/design/avatar-coin";
import { IndexHeader, Section, LeaderRow } from "@raioviajante/design/parts";
import { ToggleButton } from "@raioviajante/design/components";
import { experiments } from "../data/experiments";

export function LabIndex() {
  return (
    <>
      <IndexHeader
        name="lab"
        line="things may break."
        avatar={<AvatarCoin />}
      />
      <Section
        number="00."
        title="Experiments"
        id="experiments"
        headingExtra={
          <div className="lab-filters" aria-label="Filter experiments">
            {["all", "active", "done"].map((filter) => (
              <ToggleButton
                key={filter}
                pressed={filter === "all"}
                data-filter={filter}
              >
                {filter}
              </ToggleButton>
            ))}
          </div>
        }
      >
        <div data-experiment-list>
          {experiments.map((e) => (
            <article key={e.id} className="lab-entry" data-status={e.status}>
              <LeaderRow
                href={`/experiments/${e.slug}/`}
                label={
                  <>
                    <span className="lab-id">{e.id}</span>
                    {e.title}
                  </>
                }
                value={e.status}
              />
              <p>{e.description}</p>
              <div className="lab-entry__meta">
                {e.project} · {e.fidelity} · {e.created}
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
          3 experiments
        </p>
      </Section>
      <Section number="00.1" title="What runs here">
        <LeaderRow
          label="runs here"
          value="the real logic, executed in your browser"
        />
        <LeaderRow
          label="simulated"
          value="rules ported from a pinned revision"
        />
        <LeaderRow
          label="source only"
          value="real code to read; results are documented, not reproduced"
        />
      </Section>
      <Section number="00.2" title="Notebook" id="notebook">
        <p>Short dated entries: what changed, what broke, what got answered.</p>
        {experiments.map((e) => (
          <LeaderRow
            key={e.id}
            href={`/experiments/${e.slug}/`}
            label={
              <>
                <span className="lab-date">{e.created}</span>
                {e.title} published
              </>
            }
            value={e.id}
          />
        ))}
      </Section>
    </>
  );
}
