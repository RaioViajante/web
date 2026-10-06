import {
  LabBench,
  BenchBand,
  ToggleButton,
  ActionButton,
  CodeBlock,
  Callout,
} from "@raioviajante/design/components";
import type { BlockModel } from "@raioviajante/design/blocks";
import { sections } from "../../data/boot-sector";
export function BootBench({
  models,
  output,
}: {
  models: BlockModel[];
  output: BlockModel;
}) {
  return (
    <div data-boot>
      <LabBench
        caption="src/main.asm · e966889"
        where={
          <span
            role="status"
            aria-live="polite"
            aria-atomic="true"
            data-progress
          >
            1 / 5 · entry
          </span>
        }
      >
        <div className="boot-explorer">
          <nav className="boot-select" aria-label="Source section">
            {sections.map((section, index) => (
              <ToggleButton
                key={section.title}
                pressed={index === 0}
                data-sound="success"
                data-section={index}
              >
                {String(index + 1).padStart(2, "0")}{" "}
                {section.title.replace(/\/$/, "")}
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
                <Callout>{section.explanation}</Callout>
              </div>
            ))}
            <BenchBand>
              <div className="boot-pager">
                <ActionButton state="rejected" data-prev>
                  ← previous
                </ActionButton>
                <ActionButton data-next>next →</ActionButton>
              </div>
            </BenchBand>
          </div>
        </div>
      </LabBench>
      <CodeBlock model={output} />
      <Callout kind="important">
        The project’s learning notes record this output in QEMU. This page does
        not boot the source or reproduce that verification.
      </Callout>
      <p className="bench-help">
        Sections group the source by purpose, not file order. Source comments
        are omitted.
      </p>
      <p>
        <a
          href="https://github.com/RaioViajante/x86-os-experiment/blob/e966889b56e613d92887338a1bc979674674a115/src/main.asm"
          data-sound="nav"
        >
          assembly ↗
        </a>
      </p>
      <noscript>
        The first section is visible. Read the complete assembly using the
        source link.
      </noscript>
    </div>
  );
}
