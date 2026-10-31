import { PageHeader, Pager, LeaderRow } from "@raioviajante/design/parts";
import type { Experiment } from "../data/experiments";
import { experimentsFor, experimentPath } from "../data/experiments";
import {
  fidelityRows,
  relatedRows,
  type FidelityRow,
  type RelatedRow,
} from "../data/experiment-content";
import { displayDate, foreignLang, textFor } from "../lib/copy";
import { routePath } from "../lib/routes";

export function ExperimentHeader({
  experiment: e,
}: {
  experiment: Experiment;
}) {
  const text = textFor(e.locale);
  return (
    <PageHeader
      label={`${text.fields.experiment} ${e.id} · ${e.project}`}
      title={e.title}
      line={e.description}
      meta={[
        text.status[e.status],
        text.fidelityLabel[e.fidelity],
        <>
          {text.fields.created}{" "}
          <time dateTime={e.created}>{displayDate(e)}</time>
        </>,
        e.revision ? `${e.project} ${e.revision}` : e.project,
        ...(e.source
          ? [
              <a key="source" href={e.source} data-sound="nav">
                {text.fields.source}
              </a>,
            ]
          : []),
      ]}
    />
  );
}
export function Fidelity({ experiment: e }: { experiment: Experiment }) {
  if (!e.surface) return null;
  return (
    <>
      {(fidelityRows[e.surface][e.locale] as readonly FidelityRow[]).map(
        ({ label, value }) => (
          <LeaderRow key={label} label={label} value={value} />
        ),
      )}
    </>
  );
}
export function ExperimentRelated({
  experiment: e,
}: {
  experiment: Experiment;
}) {
  const text = textFor(e.locale);
  if (!e.surface) return null;
  return (
    <>
      {(relatedRows[e.surface][e.locale] as readonly RelatedRow[]).map(
        (row) => {
          const labelLang = row.labelLanguage
            ? foreignLang(e.locale, row.labelLanguage)
            : undefined;
          const destination = row.language
            ? foreignLang(e.locale, row.language)
            : undefined;
          return (
            <LeaderRow
              key={row.href}
              href={row.href}
              hrefLang={destination}
              label={
                <>
                  {labelLang ? (
                    <span lang={labelLang}>{row.label}</span>
                  ) : (
                    row.label
                  )}
                  {destination && row.language
                    ? ` — ${text.inLanguage(text.languageNames[row.language])}`
                    : null}
                </>
              }
              value={row.value}
            />
          );
        },
      )}
    </>
  );
}
export function ExperimentPager({ experiment: e }: { experiment: Experiment }) {
  const text = textFor(e.locale);
  const ordered = [...experimentsFor(e.locale)].reverse();
  const index = ordered.findIndex((item) => item.id === e.id);
  const prev = ordered[index - 1];
  const next = ordered[index + 1];
  const home = routePath("home", e.locale);
  return (
    <Pager
      locale={e.locale}
      prev={
        prev
          ? {
              title: `${prev.id} ${prev.title}`,
              href: experimentPath(prev),
            }
          : {
              label: `← ${text.all}`,
              title: "lab/",
              href: home,
            }
      }
      next={
        next
          ? {
              title: `${next.id} ${next.title}`,
              href: experimentPath(next),
            }
          : {
              label: `${text.all} →`,
              title: "lab/",
              href: home,
            }
      }
    />
  );
}
