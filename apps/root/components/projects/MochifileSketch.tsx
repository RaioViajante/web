"use client";

import { useEffect, useRef, useState } from "react";
import type { ProjectArtCopy } from "../../lib/projects";
import {
  formatSize,
  mochifileOriginal,
  mochifileResult,
  mochifileTargets,
  type MochifileTarget,
} from "../../lib/sketch-demos";

function Picture() {
  return (
    <span className="mo-picture" aria-hidden="true">
      <span className="mo-picture__sun" />
      <span className="mo-picture__hill" />
      <span className="mo-picture__dark" />
    </span>
  );
}

/**
 * A local demonstration of Mochifile's one tool, compressing an image to a
 * target size. Choosing a target updates example values; no file is read.
 */
export function MochifileSketch({
  label,
  example,
  text,
  intlLocale,
  wordmark,
}: {
  label: string;
  example: string;
  text: ProjectArtCopy["mochifile"];
  intlLocale: string;
  wordmark: { src: string; width: number; height: number };
}) {
  const [target, setTarget] = useState<MochifileTarget>(200);
  const result = mochifileResult(target);
  // Set through the CSSOM: Root's CSP blocks server-rendered style attributes.
  // sketches.css gives the default target's width before this runs.
  const afterBar = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    afterBar.current?.style.setProperty("width", `${result.share}%`);
  }, [result.share]);
  const size = (kb: number) => formatSize(kb, intlLocale);
  const dimensions = `${new Intl.NumberFormat(intlLocale, { useGrouping: false }).format(mochifileOriginal.width)} × ${new Intl.NumberFormat(intlLocale, { useGrouping: false }).format(mochifileOriginal.height)}`;
  return (
    <div className="sk sk--mochifile" role="group" aria-label={label}>
      <div className="mo-window">
        <div className="mo-top">
          {/* eslint-disable-next-line @next/next/no-img-element -- fixed derivative */}
          <img
            className="mo-wordmark"
            src={wordmark.src}
            alt="Mochifile"
            width={108}
            height={20}
            loading="eager"
            decoding="async"
          />
          <span className="mo-tool">{text.tool}</span>
          <span className="mo-local">{text.local}</span>
        </div>
        <div className="mo-stage">
          <div className="mo-file">
            <span className="mo-caption">{text.original}</span>
            <Picture />
            <span className="mo-name">{text.file}.jpg</span>
            <span className="mo-meta">
              {size(mochifileOriginal.kb)} · {dimensions}
            </span>
          </div>
          <div className="mo-flow">
            <span className="mo-track" aria-hidden="true">
              <span />
            </span>
            <fieldset className="mo-targets">
              <legend className="mo-caption">{text.target}</legend>
              <div className="mo-chips">
                {mochifileTargets.map((value) => (
                  <button
                    key={value}
                    type="button"
                    className="mo-chip"
                    aria-pressed={value === target}
                    data-sound="click"
                    onClick={() => setTarget(value)}
                  >
                    {size(value)}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>
          <div className="mo-file is-result">
            <span className="mo-badge">−{result.reduction}%</span>
            <span className="mo-caption">{text.result}</span>
            <Picture />
            <span className="mo-name">{text.file}.jpg</span>
            <span className="mo-meta" aria-live="polite">
              {size(result.kb)} · {text.under.replace("{size}", size(target))}
            </span>
          </div>
        </div>
        <div className="mo-bars" aria-hidden="true">
          <span className="mo-bar">
            <span>{text.before}</span>
            <span className="mo-bar__track">
              <span className="is-before" />
            </span>
            <b>{size(mochifileOriginal.kb)}</b>
          </span>
          <span className="mo-bar">
            <span>{text.after}</span>
            <span className="mo-bar__track">
              <span className="is-after" ref={afterBar} />
            </span>
            <b>{size(result.kb)}</b>
          </span>
        </div>
        <p className="mo-note">{example}</p>
      </div>
    </div>
  );
}
