import {
  LabBench,
  BenchBand,
  ActionButton,
  TableBlock,
  Callout,
} from "@raioviajante/design/components";
import { classifyFilename } from "../../lib/filename-classifier";
import { classifierCopy, type ClassifierCategory } from "../../lib/bench-copy";
import {
  categoryParts,
  emptyCounts,
  summaryParts,
  type TextPart,
} from "../../lib/classifier-view";
import { foreignLang } from "../../lib/copy";
import { LOCALES, type LocaleId } from "../../../../../site/locales";
import { Rich } from "../Rich";

export const initialNames = [
  "photo.png",
  "REPORT.PDF",
  "archive.tar.gz",
  "README",
  ".hidden",
];

function Parts({ parts }: { parts: TextPart[] }) {
  return (
    <>
      {parts.map((part, index) =>
        part.lang ? (
          <span key={index} lang={part.lang}>
            {part.text}
          </span>
        ) : (
          part.text
        ),
      )}
    </>
  );
}

export function ClassifierBench({ locale }: { locale: LocaleId }) {
  const text = classifierCopy[locale];
  // Sweep's category values are English identifiers on every page.
  const categoryLang = foreignLang(locale, "en");
  const rows = initialNames.map(classifyFilename);
  const counts = emptyCounts();
  for (const row of rows) counts[row.category as ClassifierCategory]++;
  return (
    <div
      data-classifier
      data-locale={locale}
      data-copy={JSON.stringify({
        intlLocale: LOCALES[locale].intlLocale,
        none: text.none,
        categoryGloss: text.categoryGloss,
        categoryLang: categoryLang ?? null,
        summary: text.summary,
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
                {rows.map((row) => (
                  <tr key={row.filename}>
                    <th scope="row" className="tok-string">
                      {row.filename}
                    </th>
                    <td className="tok-number">{row.suffix || text.none}</td>
                    <td className="tok-type">
                      <Parts
                        parts={categoryParts(
                          row.category as ClassifierCategory,
                          text.categoryGloss[
                            row.category as ClassifierCategory
                          ],
                          categoryLang,
                        )}
                      />
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
            <Parts
              parts={summaryParts(
                LOCALES[locale].intlLocale,
                rows.length,
                counts,
                text.summary,
                categoryLang,
              )}
            />
          </p>
        </BenchBand>
      </LabBench>
      <Callout label={text.why}>
        <span id="filename-help">
          <Rich text={text.explanation} />
        </span>
      </Callout>
      <noscript>{text.noscript}</noscript>
    </div>
  );
}
