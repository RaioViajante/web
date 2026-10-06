import { LeaderRow } from "@raioviajante/design/components";

/** A leader row that shows a short description on hover or focus. */
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
      <LeaderRow label={label} value={note} href={href} describedBy={id} />
      <div className="row-preview" id={id} role="tooltip">
        <p>{description}</p>
        {meta ? <p className="row-preview-meta">{meta}</p> : null}
      </div>
    </div>
  );
}
