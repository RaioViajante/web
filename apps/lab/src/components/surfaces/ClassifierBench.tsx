import {
  LabBench,
  BenchBand,
  ActionButton,
  TableBlock,
  Callout,
} from "@raioviajante/design/components";
import { classifyFilename } from "../../lib/filename-classifier";
import { classifierCopy } from "../../lib/copy";
import type { LocaleId } from "../../../../../site/locales";
export const initialNames = [
  "photo.png",
  "REPORT.PDF",
  "archive.tar.gz",
  "README",
  ".hidden",
];
export function ClassifierBench({ locale }: { locale: LocaleId }) {
  const text = classifierCopy[locale];
  return (
    <div
      data-classifier
      data-copy={JSON.stringify({
        categories: text.categories,
        none: text.none,
        file: text.file,
        files: text.files,
        classified: text.classified,
      })}
    >
      <LabBench
        caption={text.caption}
        where={<ActionButton data-reset>{text.reset}</ActionButton>}
      >
        <BenchBand>
          <div className="bench-inputs">
            <label>
              <span className="rv-label">{text.directory}</span>
              <input
                className="rv-input"
                id="directory"
                defaultValue="~/Downloads"
                spellCheck={false}
              />
            </label>
            <label>
              <span className="rv-label">{text.filenames}</span>
              <textarea
                className="rv-input"
                id="filenames"
                rows={5}
                defaultValue={initialNames.join("\n")}
                spellCheck={false}
                aria-describedby="filename-help"
              />
            </label>
          </div>
          <div className="bench-actions">
            <ActionButton primary data-classify>
              {text.try}
            </ActionButton>
            {[
              "notes.final.MD",
              "backup.tar",
              "image.",
              ".config.toml",
              "song.mp3",
            ].map((name) => (
              <ActionButton key={name} data-sample={name}>
                + {name}
              </ActionButton>
            ))}
          </div>
        </BenchBand>
        <BenchBand>
          <div className="classifier-output">
            <TableBlock>
              <thead>
                <tr>
                  {text.headers.map((title) => (
                    <th key={title} scope="col">
                      {title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {initialNames.map(classifyFilename).map((row) => (
                  <tr key={row.filename}>
                    <th scope="row" className="tok-string">
                      {row.filename}
                    </th>
                    <td className="tok-number">{row.suffix || text.none}</td>
                    <td className="tok-type">
                      {
                        text.categories[
                          row.category as keyof typeof text.categories
                        ]
                      }
                    </td>
                    <td>{`~/Downloads/${row.category}/${row.filename}`}</td>
                  </tr>
                ))}
              </tbody>
            </TableBlock>
          </div>
          <p
            className="classifier-counts"
            role="status"
            aria-live="polite"
            aria-atomic="true"
            data-summary
          >
            5 {text.files} {text.classified} · {text.categories.Images} 1 ·{" "}
            {text.categories.Documents} 1 · {text.categories.Archives} 1 ·{" "}
            {text.categories.Other} 2
          </p>
        </BenchBand>
      </LabBench>
      <Callout label={text.why}>
        <span id="filename-help">
          {locale === "en" ? (
            <>
              Python 3.14 <code>Path.suffix</code> treats a leading dot as part
              of the name. Only the final suffix counts:{" "}
              <code>archive.tar.gz</code> uses <code>.gz</code>. A trailing dot
              is suffix <code>.</code>, so <code>image.</code> is Other.
              Filename spaces are preserved. Destinations are previews; no files
              move.
            </>
          ) : (
            text.explanation
          )}
        </span>
      </Callout>
      <noscript>{text.noscript}</noscript>
    </div>
  );
}
