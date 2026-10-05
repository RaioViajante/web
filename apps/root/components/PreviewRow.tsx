import { LeaderRow } from "./LeaderRow";

export function PreviewRow({
  id,
  label,
  href,
  note,
  description,
  meta,
}: {
  id: string;
  label: string;
  href: string;
  note: string;
  description: string;
  meta?: string;
}) {
  return (
    <div className="preview-row">
      <LeaderRow
        name={
          <a href={href} aria-describedby={id}>
            {label}
          </a>
        }
        note={note}
      />
      <div className="row-preview" id={id} role="tooltip">
        <p>{description}</p>
        {meta ? <p className="row-preview-meta">{meta}</p> : null}
      </div>
    </div>
  );
}
