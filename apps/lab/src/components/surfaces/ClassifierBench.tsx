import {
  LabBench,
  BenchBand,
  ActionButton,
  TableBlock,
  Callout,
} from "@raioviajante/design/components";
import { classifyFilename } from "../../lib/filename-classifier";
export const initialNames = [
  "photo.png",
  "REPORT.PDF",
  "archive.tar.gz",
  "README",
  ".hidden",
];
export function ClassifierBench() {
  return (
    <div data-classifier>
      <LabBench
        caption="bench · runs in this browser"
        where={<ActionButton data-reset>reset</ActionButton>}
      >
        <BenchBand>
          <div className="bench-inputs">
            <label>
              <span className="rv-label">Directory</span>
              <input
                className="rv-input"
                id="directory"
                defaultValue="~/Downloads"
                spellCheck={false}
              />
            </label>
            <label>
              <span className="rv-label">Filenames · one per line</span>
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
              try
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
                  {["file", "suffix", "category", "destination"].map(
                    (title) => (
                      <th key={title} scope="col">
                        {title}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {initialNames.map(classifyFilename).map((row) => (
                  <tr key={row.filename}>
                    <th scope="row" className="tok-string">
                      {row.filename}
                    </th>
                    <td className="tok-number">{row.suffix || "(none)"}</td>
                    <td className="tok-type">{row.category}</td>
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
            5 files · Images 1 · Documents 1 · Archives 1 · Other 2
          </p>
        </BenchBand>
      </LabBench>
      <Callout label={'Why .hidden is "Other"'}>
        <span id="filename-help">
          Python 3.14 <code>Path.suffix</code> treats a leading dot as part of
          the name. Only the final suffix counts: <code>archive.tar.gz</code>{" "}
          uses <code>.gz</code>. A trailing dot is suffix <code>.</code>, so{" "}
          <code>image.</code> is Other. Filename spaces are preserved.
          Destinations are previews; no files move.
        </span>
      </Callout>
      <noscript>
        The examples are precomputed. Enable JavaScript to try other filenames.
      </noscript>
    </div>
  );
}
