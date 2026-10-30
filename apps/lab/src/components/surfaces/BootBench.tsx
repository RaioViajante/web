import {
  LabBench,
  BenchBand,
  ToggleButton,
  ActionButton,
  CodeBlock,
  Callout,
} from "@raioviajante/design/components";
import type { BlockModel } from "@raioviajante/design/blocks";
import { sectionsFor } from "../../data/boot-sector";
import { bootCopy } from "../../lib/bench-copy";
import { fill } from "../../lib/template";
import type { LocaleId } from "../../../../../site/locales";

const sectionName = (title: string) => title.replace(/\/$/, "");

export function BootBench({
  locale,
  models,
  output,
}: {
  locale: LocaleId;
  models: BlockModel[];
  output: BlockModel;
}) {
  const text = bootCopy[locale];
  const sections = sectionsFor(locale);
  return (
    <div
      data-boot
      data-copy={JSON.stringify({
        progress: text.progress,
        rejectedPrevious: text.rejectedPrevious,
        rejectedNext: text.rejectedNext,
      })}
    >
      <LabBench
        caption="src/main.asm · e966889"
        where={
          <span
            role="status"
            aria-live="polite"
            aria-atomic="true"
            data-progress
          >
            {fill(text.progress, {
              number: 1,
              total: sections.length,
              title: sectionName(sections[0]!.title),
            })}
          </span>
        }
      >
        <div className="boot-explorer">
          <nav className="boot-select" aria-label={text.sectionNavAria}>
            {sections.map((section, index) => (
              <ToggleButton
                key={section.title}
                pressed={index === 0}
                data-sound="success"
                data-section={index}
                data-title={sectionName(section.title)}
              >
                {String(index + 1).padStart(2, "0")}{" "}
                {sectionName(section.title)}
              </ToggleButton>
            ))}
          </nav>
          <div className="boot-content">
            {sections.map((section, index) => (
              <div
                className="boot-panel"
                data-panel={index}
                hidden={index !== 0}
                key={section.title}
              >
                <CodeBlock model={models[index]} />
                <Callout label={text.noteLabel}>{section.explanation}</Callout>
              </div>
            ))}
            <BenchBand>
              <div className="boot-pager">
                <ActionButton state="rejected" data-prev>
                  {text.previous}
                </ActionButton>
                <ActionButton data-next>{text.next}</ActionButton>
              </div>
            </BenchBand>
          </div>
        </div>
      </LabBench>
      <CodeBlock model={output} />
      <Callout kind="important" label={text.importantLabel}>
        {text.important}
      </Callout>
      <p className="bench-help">{text.help}</p>
      <p>
        <a
          href="https://github.com/RaioViajante/x86-os-experiment/blob/e966889b56e613d92887338a1bc979674674a115/src/main.asm"
          data-sound="nav"
        >
          {text.assemblyLink}
        </a>
      </p>
      <noscript>{text.noscript}</noscript>
    </div>
  );
}
