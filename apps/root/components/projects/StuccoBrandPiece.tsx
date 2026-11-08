"use client";

import { useState } from "react";
import type { StuccoImage } from "@raioviajante/design/stucco";
import type { StuccoCopy, StuccoPiece } from "../../lib/stucco";

/** One brand piece, with a toggle between its mockup and its flat art. */
export function StuccoBrandPiece({
  id,
  mockup,
  art,
  artAlt,
  text,
}: {
  id: StuccoPiece;
  mockup: StuccoImage;
  art: readonly StuccoImage[];
  artAlt: readonly string[];
  text: StuccoCopy["brand"];
}) {
  const [showArt, setShowArt] = useState(false);
  const { title, spec } = text.pieces[id];
  const modes = [
    { value: false, label: text.mockup },
    { value: true, label: text.art },
  ];
  return (
    <figure className="bd-item">
      <div className={`bd-box k-${id} ${showArt ? "is-art" : "is-mock"}`}>
        {/* eslint-disable-next-line @next/next/no-img-element -- static derivative with its own srcset */}
        <img
          className="bd-mock"
          src={mockup.src}
          srcSet={mockup.srcSet}
          sizes="(max-width: 760px) 90vw, 360px"
          alt={`Stucco. · ${title} · ${text.mockup}`}
          width={mockup.width}
          height={mockup.height}
          loading="lazy"
          decoding="async"
        />
        <div className="bd-art">
          {art.map((image, index) => (
            // eslint-disable-next-line @next/next/no-img-element -- static derivative
            <img
              key={image.src}
              src={image.src}
              alt={artAlt[index]!}
              width={image.width}
              height={image.height}
              loading="lazy"
              decoding="async"
            />
          ))}
        </div>
      </div>
      <figcaption>
        <span className="bd-t">
          <b>{title}</b>
          <span>{spec}</span>
        </span>
        <span className="bd-seg" role="group" aria-label={title}>
          {modes.map(({ value, label }) => (
            <button
              key={label}
              type="button"
              aria-pressed={showArt === value}
              data-sound="tab"
              onClick={() => setShowArt(value)}
            >
              {label}
            </button>
          ))}
        </span>
      </figcaption>
    </figure>
  );
}
