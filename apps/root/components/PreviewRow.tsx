import Link from "next/link";
import { LeaderRow } from "@raioviajante/design/components";
import type { LocaleId } from "../../../site/locales";

/**
 * A leader row that shows a short description on hover or focus. A link that
 * leaves the four sites opens in a new tab and says so in the page's language.
 */
export function PreviewRow({
  id,
  label,
  href,
  note,
  description,
  meta,
  rel,
  locale,
}: {
  id: string;
  label: string;
  href: string;
  note: string;
  description: string;
  meta?: string;
  rel?: string;
  /** The page's language. */
  locale: LocaleId;
}) {
  return (
    <div className="preview-row">
      <LeaderRow
        label={label}
        value={note}
        href={href}
        describedBy={id}
        linkComponent={Link}
        rel={rel}
        newTab={locale}
      />
      <div className="row-preview" id={id} role="tooltip">
        <p>{description}</p>
        {meta ? <p className="row-preview-meta">{meta}</p> : null}
      </div>
    </div>
  );
}
