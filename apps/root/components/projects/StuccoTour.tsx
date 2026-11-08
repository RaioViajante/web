"use client";

import { useEffect, useRef, useState } from "react";
import type { stuccoTour } from "@raioviajante/design/stucco";
import type { StuccoCopy, StuccoDevice, StuccoGroup } from "../../lib/stucco";

const pad = (value: number) => String(value).padStart(2, "0");
const devices: StuccoDevice[] = ["desktop", "mobile"];
const shotSizes: Record<StuccoDevice, string> = {
  desktop: "(max-width: 760px) 90vw, 680px",
  mobile: "(max-width: 760px) 60vw, 260px",
};

/** The guided tour: device toggle, one screenshot, caption and a thumbnail strip. */
export function StuccoTour({
  text,
  tour,
}: {
  text: StuccoCopy["tour"];
  tour: typeof stuccoTour;
}) {
  const [device, setDevice] = useState<StuccoDevice>("desktop");
  const [step, setStep] = useState(0);
  const strip = useRef<HTMLDivElement>(null);
  const steps = tour[device];
  const current = steps[step]!;
  const caption = text.captions[device][current.key]!;
  const group = text.groups[current.group as StuccoGroup];
  const counter = `${pad(step + 1)} / ${pad(steps.length)} · ${group}`;
  const go = (next: number) => setStep((next + steps.length) % steps.length);

  useEffect(() => {
    const row = strip.current;
    const thumb = row?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (!row || !thumb || row.scrollWidth <= row.clientWidth) return;
    row.scrollTo({
      left: thumb.offsetLeft - row.clientWidth / 2 + thumb.offsetWidth / 2,
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  }, [device, step]);

  const shot = (
    // eslint-disable-next-line @next/next/no-img-element -- static derivative with its own srcset
    <img
      key={`${device}-${step}`}
      className="sc-shot"
      src={current.shot.src}
      srcSet={current.shot.srcSet}
      sizes={shotSizes[device]}
      alt={text.shotAlt
        .replace("{device}", text[device])
        .replace("{title}", caption.title)}
      width={current.shot.width}
      height={current.shot.height}
      decoding="async"
    />
  );

  return (
    <section className="sc-tour" id="sc-tour" aria-labelledby="sc-tour-heading">
      <div className="sc-bar">
        <h2 id="sc-tour-heading">
          <span>01</span>
          {text.heading}
        </h2>
        <div className="sc-seg" role="group" aria-label={text.device}>
          {devices.map((value) => (
            <button
              key={value}
              type="button"
              className="sc-t"
              aria-pressed={device === value}
              data-sound="tab"
              onClick={() => {
                if (value === device) return;
                setDevice(value);
                setStep(0);
              }}
            >
              {text[value]}
            </button>
          ))}
        </div>
      </div>
      <div className={`sc-stage is-${device}`}>
        {device === "desktop" ? (
          <div className="sc-win">
            <div className="sc-chrome">
              <i />
              <i />
              <i />
              <span className="sc-url">
                raioviajante.com/work/stucco/{current.url}
              </span>
            </div>
            {shot}
          </div>
        ) : (
          <div className="sc-phone">{shot}</div>
        )}
      </div>
      <div className="sc-cap">
        <span className="sc-n">{counter}</span>
        <div>
          <b>{caption.title}</b>
          <p>{caption.caption}</p>
        </div>
        <div className="sc-nav">
          <button
            type="button"
            className="sc-arr"
            aria-label={text.previous}
            data-sound="click"
            onClick={() => go(step - 1)}
          >
            ←
          </button>
          <button
            type="button"
            className="sc-arr"
            aria-label={text.next}
            data-sound="click"
            onClick={() => go(step + 1)}
          >
            →
          </button>
        </div>
      </div>
      <p className="rv-sr-only" aria-live="polite">
        {counter}: {caption.title}
      </p>
      <div
        ref={strip}
        className={`sc-steps is-${device}`}
        role="group"
        aria-label={text.steps}
      >
        {steps.map((item, index) => {
          const name = text.captions[device][item.key]!.title;
          const area = text.groups[item.group as StuccoGroup];
          return (
            <button
              key={item.key}
              type="button"
              className="sc-th"
              aria-pressed={index === step}
              aria-label={`${pad(index + 1)} · ${area} · ${name}`}
              data-sound="tab"
              onClick={() => go(index)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- static derivative */}
              <img
                src={item.thumb.src}
                alt=""
                width={item.thumb.width}
                height={item.thumb.height}
                loading="lazy"
                decoding="async"
              />
            </button>
          );
        })}
      </div>
    </section>
  );
}
