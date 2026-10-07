import {
  PageHeader,
  Pager,
  LeaderRow,
  RelatedRows,
} from "@raioviajante/design/parts";
import type { Experiment } from "../data/experiments";
import { experiments } from "../data/experiments";

export function ExperimentHeader({
  experiment: e,
}: {
  experiment: Experiment;
}) {
  return (
    <PageHeader
      label={`EXPERIMENT ${e.id} · ${e.project}`}
      title={e.title}
      line={e.description}
      meta={[
        e.status,
        e.fidelity,
        `created ${e.created}`,
        `${e.project} ${e.revision}`,
        ...(e.source
          ? [
              <a key="source" href={e.source} data-sound="nav">
                source ↗
              </a>,
            ]
          : []),
      ]}
    />
  );
}
export function Fidelity({ experiment: e }: { experiment: Experiment }) {
  const rows =
    e.surface === "filename-classifier"
      ? [
          ["classification rules", "as documented in docs"],
          ["suffix behavior", "Python 3.14 Path.suffix"],
          ["file system access", "none · nothing moves"],
          ["conflict check, size", "not reproduced"],
        ]
      : e.surface === "execution-states"
        ? [
            ["transition rules", "ported from orbit cd97666"],
            ["commands, scheduler", "none"],
            ["persistence", "none · reload starts over"],
            ["retry and timeout", "configuration only, not exercised"],
          ]
        : [
            ["source", "real · revision e966889 · comments omitted"],
            ["execution", "none · not booted, not emulated"],
            ["result", "documented in project notes"],
          ];
  return (
    <>
      {rows.map(([label, value]) => (
        <LeaderRow key={label} label={label} value={value} />
      ))}
    </>
  );
}
export function ExperimentRelated({
  experiment: e,
}: {
  experiment: Experiment;
}) {
  const items =
    e.surface === "filename-classifier"
      ? [
          {
            title: "Sweep · classification",
            site: "docs" as const,
            href: "https://docs.raioviajante.com/projects/sweep/#012classification",
          },
          {
            title: "Apparently Moving a File Has Edge Cases",
            site: "dump" as const,
            href: "https://dump.raioviajante.com/posts/apparently-moving-a-file-has-edge-cases",
          },
          {
            title: "A TOML File Changed What Sweep Was",
            site: "dump" as const,
            href: "https://dump.raioviajante.com/posts/a-toml-file-changed-what-sweep-was",
          },
        ]
      : e.surface === "execution-states"
        ? [
            {
              title: "An Execution Is More Than a Row in a Database",
              site: "dump" as const,
              href: "https://dump.raioviajante.com/posts/an-execution-is-more-than-a-row-in-a-database",
            },
            {
              title: "I Got Bored of CRUD, So I'm Building a Scheduler",
              site: "dump" as const,
              href: "https://dump.raioviajante.com/posts/building-orbit",
            },
          ]
        : [
            {
              title: "There Is No printf Down Here",
              site: "dump" as const,
              href: "https://dump.raioviajante.com/posts/there-is-no-printf-down-here",
            },
          ];
  return (
    <>
      <RelatedRows items={items} />
      {e.surface === "boot-sector" && (
        <LeaderRow
          label="learning notes"
          value="github ↗"
          href="https://github.com/RaioViajante/x86-os-experiment/blob/e966889b56e613d92887338a1bc979674674a115/docs/01-boot-sector.md"
        />
      )}
    </>
  );
}
export function ExperimentPager({ experiment: e }: { experiment: Experiment }) {
  const ordered = [...experiments].reverse();
  const index = ordered.findIndex((item) => item.id === e.id);
  const prev = ordered[index - 1];
  const next = ordered[index + 1];
  return (
    <Pager
      prev={
        prev
          ? {
              label: "← Previous",
              title: `${prev.id} ${prev.title}`,
              href: `/experiments/${prev.slug}/`,
            }
          : { label: "← All experiments", title: "lab/", href: "/" }
      }
      next={
        next
          ? {
              label: "Next →",
              title: `${next.id} ${next.title}`,
              href: `/experiments/${next.slug}/`,
            }
          : { label: "All experiments →", title: "lab/", href: "/" }
      }
    />
  );
}
