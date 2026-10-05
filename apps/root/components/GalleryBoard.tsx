"use client";

import Image from "next/image";
import { useState } from "react";

const artworks = [
  {
    id: "castle",
    src: "/art/gallery/moonlit-castle.webp",
    alt: "RaioViajante running from a moonlit castle",
    width: 1672,
    height: 941,
  },
  {
    id: "sunset",
    src: "/art/gallery/ukulele-sunset.webp",
    alt: "RaioViajante playing ukulele beside the sea at sunset",
    width: 1672,
    height: 941,
  },
  {
    id: "portrait",
    src: "/art/gallery/purple-portrait.webp",
    alt: "A thoughtful purple portrait of the RaioViajante character",
    width: 941,
    height: 1672,
  },
  {
    id: "cats",
    src: "/art/gallery/playful-cats.webp",
    alt: "Three playful black cats against a purple background",
    width: 1536,
    height: 1024,
  },
  {
    id: "calves",
    src: "/art/gallery/playful-calves.webp",
    alt: "Two playful calves in motion",
    width: 1448,
    height: 1086,
  },
  {
    id: "calf",
    src: "/art/gallery/calf-portrait.webp",
    alt: "A small calf sitting against a purple background",
    width: 1536,
    height: 1024,
  },
  {
    id: "mirror",
    src: "/art/gallery/mirror-reflection.webp",
    alt: "RaioViajante looking into a mirror with a goofy reflection",
    width: 1448,
    height: 1086,
  },
  {
    id: "lab",
    src: "/art/gallery/neon-lab.webp",
    alt: "RaioViajante celebrating in a neon code lab",
    width: 1672,
    height: 941,
  },
] as const;

function Artwork({
  artwork,
  order,
}: {
  artwork: (typeof artworks)[number];
  order: number;
}) {
  return (
    <a
      className={`gallery-tile gallery-tile--${artwork.id}`}
      href={artwork.src}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Open artwork: ${artwork.alt}`}
      data-sound="gallery"
      style={{ animationDelay: `${order * 105}ms` }}
    >
      <Image
        src={artwork.src}
        alt={artwork.alt}
        width={artwork.width}
        height={artwork.height}
        sizes="(max-width: 760px) 60vw, 420px"
        loading={order < 5 ? "eager" : "lazy"}
      />
    </a>
  );
}

export function GalleryBoard() {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="gallery-board" data-revealed={revealed}>
      <button
        className="gallery-opening"
        type="button"
        aria-label="Reveal the artwork collection"
        aria-hidden={revealed}
        disabled={revealed}
        onClick={() => {
          window.dispatchEvent(new Event("rv-gallery-reveal"));
          setRevealed(true);
        }}
      >
        <Image
          src="/art/gallery/work-of-art.webp"
          alt=""
          width={941}
          height={1672}
          priority
        />
      </button>
      <div
        className="gallery-collection"
        aria-label="RaioViajante artwork collection"
        aria-hidden={!revealed}
        inert={!revealed}
      >
        <div className="gallery-cluster gallery-cluster--first">
          {artworks.slice(0, 5).map((artwork, index) => (
            <Artwork key={artwork.id} artwork={artwork} order={index} />
          ))}
        </div>
        <div className="gallery-cluster gallery-cluster--second">
          {artworks.slice(5).map((artwork, index) => (
            <Artwork key={artwork.id} artwork={artwork} order={index + 5} />
          ))}
        </div>
      </div>
    </div>
  );
}
