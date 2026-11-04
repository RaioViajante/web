// The small sketches of the four featured projects (home page and catalog).
// Server-rendered,
// decorative (each card names and describes its project in text), animated
// only by CSS, and still under reduced motion. No inline styles: Root's CSP
// blocks style attributes, so positions and timings live in projects.css.

import { projectIcons } from "@raioviajante/design/projects";
import type { ProjectArtCopy } from "../../lib/projects";
import {
  formatSize,
  mochifileOriginal,
  mochifileResult,
} from "../../lib/sketch-demos";
import { hatchCircle, roughEllipse, roughLine } from "../../lib/sketch";
import "@raioviajante/design/project-art.css";
import "./minis.css";

function Thumb() {
  return (
    <span className="mn-thumb">
      <span className="mn-thumb__sun" />
      <span className="mn-thumb__hill" />
      <span className="mn-thumb__dark" />
    </span>
  );
}

function MochifileMini({
  copy,
  intlLocale,
}: {
  copy: ProjectArtCopy;
  intlLocale: string;
}) {
  const result = mochifileResult(200);
  return (
    <>
      <span className="mn-mochi__files">
        <span className="mn-mochi__file">
          <Thumb />
          <span className="mn-mochi__text">
            <b>{copy.mochifile.file}.jpg</b>
            <span>{formatSize(mochifileOriginal.kb, intlLocale)}</span>
          </span>
        </span>
        <span className="mn-mochi__track">
          <span />
        </span>
        <span className="mn-mochi__file">
          <Thumb />
          <span className="mn-mochi__text">
            <b>
              {copy.mochifile.file}.jpg{" "}
              <span className="mn-mochi__badge">−{result.reduction}%</span>
            </b>
            <span>{formatSize(result.kb, intlLocale)}</span>
          </span>
        </span>
      </span>
      <span className="mn-mochi__bars">
        <i className="is-before" />
        <i className="is-after" />
      </span>
      <span className="mn-note">{copy.example}</span>
    </>
  );
}

function OrdelisMini({ copy }: { copy: ProjectArtCopy }) {
  return (
    <>
      <svg
        className="mn-ord__links"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <path d="M31 52 C 34 52, 34 38, 38 38" />
        <path d="M31 52 C 34 52, 34 66, 38 66" />
        <path d="M68 38 C 71 38, 71 52, 74 52" />
        <path d="M68 66 C 71 66, 71 52, 74 52" />
      </svg>
      <span className="mn-ord__col">
        <span className="mn-ord__label">{copy.ordelis.task}</span>
        <span className="mn-ord__box">#128</span>
      </span>
      <span className="mn-ord__col">
        <span className="mn-ord__box mn-ord__agent">
          <span className="mn-ord__name">
            <i>CC</i>Claude Code
          </span>
          <span className="mn-ord__run" />
        </span>
        <span className="mn-ord__box mn-ord__agent is-second">
          <span className="mn-ord__name">
            <i>Cx</i>Codex
          </span>
          <span className="mn-ord__run" />
        </span>
      </span>
      <span className="mn-ord__col">
        <span className="mn-ord__label">{copy.ordelis.you}</span>
        <span className="mn-ord__box mn-ord__you">
          {copy.ordelis.approve}
          <span className="mn-ord__ok">✓</span>
        </span>
      </span>
    </>
  );
}

/** The record: rough grooves around a hatched label. */
export function Disc({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="-112 -112 224 224" aria-hidden="true">
      <circle className="sk-paper" r="106" />
      <path d={roughEllipse(0, 0, 104, 104, 11, 0.012)} />
      <path className="is-thin" d={roughEllipse(0, 0, 84, 84, 12, 0.015)} />
      <path className="is-thin" d={roughEllipse(0, 0, 66, 66, 13, 0.02)} />
      <path d={roughEllipse(0, 0, 44, 44, 14, 0.03)} />
      <path className="is-thin" d={hatchCircle(42, 6, 15)} />
      <circle className="sk-ink" r="3" />
    </svg>
  );
}

function RefrainMini({ copy }: { copy: ProjectArtCopy }) {
  return (
    <>
      <svg
        className="mn-rf__lines"
        viewBox="0 0 300 40"
        preserveAspectRatio="none"
      >
        <path d={roughLine(0, 4, 296, 3, 21, 1.6)} />
        <path d={roughLine(0, 18, 220, 19, 22, 1.4)} />
        <path d={roughLine(0, 32, 260, 31, 23, 1.6)} />
      </svg>
      <span className="mn-rf__tag">{copy.refrain.tagline}</span>
      <span className="mn-rf__sticker">
        {/* eslint-disable-next-line @next/next/no-img-element -- fixed derivative */}
        <img
          src={projectIcons.refrain.src}
          alt=""
          width={46}
          height={46}
          loading="lazy"
          decoding="async"
        />
      </span>
      <Disc className="mn-rf__disc" />
    </>
  );
}

function OrbitMini({ copy }: { copy: ProjectArtCopy }) {
  const { orbit } = copy;
  return (
    <>
      <span className="mn-ob__system">
        <span className="mn-ob__ring is-outer" />
        <span className="mn-ob__ring is-middle" />
        <span className="mn-ob__ring is-inner" />
        <span className="mn-ob__core" />
        <span className="mn-ob__job is-queued">
          <i />
        </span>
        <span className="mn-ob__job is-running">
          <i />
        </span>
        <span className="mn-ob__job is-done">
          <i />
        </span>
      </span>
      <span className="mn-ob__log">
        <span>
          <b>exec-0141</b> {orbit.queued}
        </span>
        <span className="is-hot">
          <b>exec-0142</b> {orbit.running} → {orbit.succeeded}
        </span>
        <span>
          <b>exec-0143</b> {orbit.queued} → {orbit.running}
        </span>
      </span>
    </>
  );
}

export type FeaturedId = "mochifile" | "ordelis" | "refrain" | "orbit";

/** The small sketch of a featured project. */
export function FeaturedMini({
  id,
  copy,
  intlLocale,
}: {
  id: FeaturedId;
  copy: ProjectArtCopy;
  intlLocale: string;
}) {
  return (
    <span className={`mn mn--${id}`} aria-hidden="true">
      {id === "mochifile" ? (
        <MochifileMini copy={copy} intlLocale={intlLocale} />
      ) : id === "ordelis" ? (
        <OrdelisMini copy={copy} />
      ) : id === "refrain" ? (
        <RefrainMini copy={copy} />
      ) : (
        <OrbitMini copy={copy} />
      )}
    </span>
  );
}
