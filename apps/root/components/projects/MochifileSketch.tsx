"use client";

import { useEffect, useRef, useState } from "react";
import type { ProjectArtCopy } from "../../lib/projects";
import {
  formatSize,
  mochifileConverted,
  mochifileFormats,
  mochifileOriginal,
  mochifileResized,
  mochifileResult,
  mochifileTargets,
  mochifileWidths,
  type MochifileFormat,
  type MochifileTarget,
  type MochifileWidth,
} from "../../lib/sketch-demos";

type Tool = "compress" | "convert" | "resize";
const tools: Tool[] = ["compress", "convert", "resize"];

function Picture({ className = "" }: { className?: string }) {
  return (
    <span className={`mo-picture ${className}`} aria-hidden="true">
      <span className="mo-picture__sun" />
      <span className="mo-picture__hill" />
      <span className="mo-picture__dark" />
    </span>
  );
}

/** One row of option chips with its visible name. */
function Options<T extends string | number>({
  legend,
  values,
  current,
  format,
  onPick,
}: {
  legend: string;
  values: readonly T[];
  current: T;
  format: (value: T) => string;
  onPick: (value: T) => void;
}) {
  return (
    <fieldset className="mo-options">
      <legend className="mo-caption">{legend}</legend>
      <div className="mo-chips" data-count={values.length}>
        {values.map((value) => (
          <button
            key={value}
            type="button"
            className="mo-chip"
            aria-pressed={value === current}
            data-sound="click"
            onClick={() => onPick(value)}
          >
            {format(value)}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

/**
 * A local demonstration of Mochifile with the design's three tabs. Compress is
 * the tool Mochifile has today (to a target size); Convert and Resize are
 * coming soon there, and the note says so on those tabs. Every value is an
 * example; no file is read.
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
  const [tool, setTool] = useState<Tool>("compress");
  const [target, setTarget] = useState<MochifileTarget>(200);
  const [format, setFormat] = useState<MochifileFormat>("webp");
  const [width, setWidth] = useState<MochifileWidth>(1600);

  const size = (kb: number) => formatSize(kb, intlLocale);
  const integer = new Intl.NumberFormat(intlLocale, { useGrouping: false });
  const dimensions = (w: number, h: number) =>
    `${integer.format(w)} × ${integer.format(h)}`;
  const original = dimensions(
    mochifileOriginal.width,
    mochifileOriginal.height,
  );

  let kb: number, change: number, before: number, after: number;
  let extension = "jpg";
  let detail: string;
  if (tool === "compress") {
    const result = mochifileResult(target);
    kb = result.kb;
    change = -result.reduction;
    before = 100;
    after = result.share;
    detail = text.under.replace("{size}", size(target));
  } else if (tool === "convert") {
    ({ kb, change, before, after } = mochifileConverted(format));
    extension = format;
    detail = original;
  } else {
    const result = mochifileResized(width);
    ({ kb, change, before, after } = result);
    detail = dimensions(result.width, result.height);
  }

  // Set through the CSSOM: Root's CSP blocks server-rendered style attributes.
  // sketches.css gives the default tab's widths before this runs.
  const beforeBar = useRef<HTMLSpanElement>(null);
  const afterBar = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    beforeBar.current?.style.setProperty("width", `${before}%`);
    afterBar.current?.style.setProperty("width", `${after}%`);
  }, [before, after]);

  const tabName: Record<Tool, string> = {
    compress: text.compress,
    convert: text.convert,
    resize: text.resize,
  };

  return (
    <div
      className="sk sk--mochifile"
      role="group"
      aria-label={label}
      data-tool={tool}
    >
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
          <div className="mo-tabs" role="group" aria-label={text.tools}>
            {tools.map((value) => (
              <button
                key={value}
                type="button"
                className="mo-tab"
                aria-pressed={value === tool}
                data-sound="click"
                onClick={() => setTool(value)}
              >
                {tabName[value]}
              </button>
            ))}
          </div>
          <span className="mo-local">{text.local}</span>
        </div>
        <div className="mo-stage">
          <div className="mo-file">
            <span className="mo-caption">{text.original}</span>
            <span className="mo-thumb">
              <Picture />
            </span>
            <span className="mo-name">{text.file}.jpg</span>
            <span className="mo-meta">
              {size(mochifileOriginal.kb)} · {original}
            </span>
          </div>
          <div className="mo-flow">
            <span className="mo-track" aria-hidden="true">
              <span />
            </span>
            {tool === "compress" ? (
              <Options
                legend={text.target}
                values={mochifileTargets}
                current={target}
                format={size}
                onPick={setTarget}
              />
            ) : tool === "convert" ? (
              <Options
                legend={text.format}
                values={mochifileFormats}
                current={format}
                format={(value) => value.toUpperCase()}
                onPick={setFormat}
              />
            ) : (
              <Options
                legend={text.width}
                values={mochifileWidths}
                current={width}
                format={(value) => integer.format(value)}
                onPick={setWidth}
              />
            )}
          </div>
          <div className="mo-file is-result">
            <span className={`mo-badge${change > 0 ? " is-up" : ""}`}>
              {change > 0 ? "+" : "−"}
              {Math.abs(change)}%
            </span>
            <span className="mo-caption">{text.result}</span>
            <span className="mo-thumb" data-width={width}>
              <Picture className="is-ghost" />
              <Picture className="is-out" />
              <span className="mo-frame" aria-hidden="true">
                <span />
                <span />
                <span />
                <span />
              </span>
            </span>
            <span className="mo-name">
              {text.file}.{extension}
            </span>
            <span className="mo-meta" aria-live="polite">
              {size(kb)} · {detail}
            </span>
          </div>
        </div>
        <div className="mo-bars" aria-hidden="true">
          <span className="mo-bar">
            <span>{text.before}</span>
            <span className="mo-bar__track">
              <span className="is-before" ref={beforeBar} />
            </span>
            <b>{size(mochifileOriginal.kb)}</b>
          </span>
          <span className="mo-bar">
            <span>{text.after}</span>
            <span className="mo-bar__track">
              <span
                className={`is-after${change > 0 ? " is-up" : ""}`}
                ref={afterBar}
              />
            </span>
            <b>{size(kb)}</b>
          </span>
        </div>
        <p className="mo-note">
          {tool === "compress" ? example : `${text.soon} · ${example}`}
        </p>
      </div>
    </div>
  );
}
