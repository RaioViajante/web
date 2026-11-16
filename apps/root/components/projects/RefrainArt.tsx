// Refrain's card art, in the app's own clothes: paper, a wine wordmark, a
// record half out of a sleeve with Jeff Buckley's Grace, a note in pen and a
// navy band under a torn edge. The one place Refrain's typefaces appear
// (refrain-art.css in the design package). Decorative: the card names and
// describes the project in text. Server-rendered; the record slides out and
// turns while the card is hovered or focused, and stays still under reduced
// motion.

import { refrainArt } from "@raioviajante/design/refrain";
import type { ProjectArtCopy } from "../../lib/projects";
import "@raioviajante/design/project-art.css";
import "@raioviajante/design/refrain-art.css";
import "./refrain-art.css";

function Cover({ className }: { className: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- fixed derivative
    <img
      className={className}
      src={refrainArt.cover.src}
      alt=""
      width={refrainArt.cover.width}
      height={refrainArt.cover.height}
      loading="lazy"
      decoding="async"
    />
  );
}

function Edge({ className }: { className: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- fixed derivative
    <img
      className={className}
      src={refrainArt.tornEdge.src}
      alt=""
      width={refrainArt.tornEdge.width}
      height={refrainArt.tornEdge.height}
      loading="lazy"
      decoding="async"
    />
  );
}

/** The large art on the cards of /projects and the home page. */
function CardArt({ copy }: { copy: ProjectArtCopy["refrain"] }) {
  return (
    <span className="rf3 rf-paper" aria-hidden="true">
      <span className="rf3-k">{copy.kicker}</span>
      <span className="rf3-w">refrain</span>
      <span className="rf3-t">{copy.tagline}</span>
      <span className="rf3-sl">
        <span className="rf3-v">
          <span className="rf3-sh" />
          <span className="rf3-lb">
            <span className="rf3-l1">jeff buckley</span>
            <span className="rf3-l2">GRACE · 1994</span>
          </span>
        </span>
        <span className="rf3-c">
          <b>Grace.</b>
          <Cover className="rf3-img" />
          <span className="rf3-ft">
            <i>1994</i>
            <em>
              jeff
              <br />
              buckley
            </em>
          </span>
        </span>
      </span>
      <span className="rf3-n">{copy.note}</span>
      <span className="rf3-nv rf-navy" />
      <Edge className="rf3-e" />
    </span>
  );
}

/** The compact art on the catalog's tiles. */
function TileArt({ copy }: { copy: ProjectArtCopy["refrain"] }) {
  return (
    <span className="rfm rf-paper" aria-hidden="true">
      <span className="rfm-w">refrain</span>
      <span className="rfm-t">{copy.tagline}</span>
      <span className="rfm-sl">
        <span className="rfm-v">
          <span className="rf3-sh" />
          <span className="rfm-lb" />
        </span>
        <span className="rfm-c">
          <b>Grace.</b>
          <Cover className="rfm-img" />
        </span>
      </span>
      <span className="rfm-nv rf-navy" />
      <Edge className="rfm-e" />
    </span>
  );
}

export function RefrainArt({
  copy,
  size,
}: {
  copy: ProjectArtCopy["refrain"];
  size: "card" | "tile";
}) {
  return size === "card" ? <CardArt copy={copy} /> : <TileArt copy={copy} />;
}
