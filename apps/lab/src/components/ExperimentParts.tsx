import {
  PageHeader,
  Pager,
  LeaderRow,
  RelatedRows,
} from "@raioviajante/design/parts";
import type { Experiment } from "../data/experiments";
import { experimentsFor, experimentPath } from "../data/experiments";
import { displayDate, textFor } from "../lib/copy";

export function ExperimentHeader({
  experiment: e,
}: {
  experiment: Experiment;
}) {
  return (
    <PageHeader
      label={`${e.locale === "en" ? "EXPERIMENT" : "EXPERIMENTO"} ${e.id} · ${e.project}`}
      title={e.title}
      line={e.description}
      meta={[
        textFor(e.locale).status[e.status],
        textFor(e.locale).fidelityLabel[e.fidelity],
        `${textFor(e.locale).created} ${displayDate(e)}`,
        `${e.project} ${e.revision}`,
        ...(e.source
          ? [
              <a key="source" href={e.source} data-sound="nav">
                {textFor(e.locale).source}
              </a>,
            ]
          : []),
      ]}
    />
  );
}
export function Fidelity({ experiment: e }: { experiment: Experiment }) {
  if (e.locale === "pt-BR")
    return (
      <>
        {[
          ["regras de classificação", "conforme documentadas no Docs"],
          ["comportamento da extensão", "Python 3.14 Path.suffix"],
          ["acesso ao sistema de arquivos", "nenhum · nada é movido"],
          ["verificação de conflitos e tamanho", "não reproduzidas"],
        ].map(([label, value]) => (
          <LeaderRow key={label} label={label} value={value} />
        ))}
      </>
    );
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
  if (e.locale === "pt-BR")
    return (
      <>
        <LeaderRow
          label="Sweep · classificação"
          value="docs ↗"
          href="https://docs.raioviajante.com/pt/projetos/sweep/#classificação"
        />
        <LeaderRow
          label="código-fonte do Sweep"
          value="github ↗"
          href={e.source}
        />
      </>
    );
  const items =
    e.surface === "filename-classifier"
      ? [
          {
            title: "Sweep · classification",
            site: "docs" as const,
            href: "https://docs.raioviajante.com/projects/sweep/#classification",
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
  const ordered = [...experimentsFor(e.locale)].reverse();
  const index = ordered.findIndex((item) => item.id === e.id);
  const prev = ordered[index - 1];
  const next = ordered[index + 1];
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
              label: `← ${textFor(e.locale).all}`,
              title: "lab/",
              href: e.locale === "en" ? "/" : "/pt/",
            }
      }
      next={
        next
          ? {
              title: `${next.id} ${next.title}`,
              href: experimentPath(next),
            }
          : {
              label: `${textFor(e.locale).all} →`,
              title: "lab/",
              href: e.locale === "en" ? "/" : "/pt/",
            }
      }
    />
  );
}
