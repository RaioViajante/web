"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const artworks = [
  {
    id: "castle",
    src: "/gallery/moonlit-castle.png",
    alt: "RaioViajante running from a moonlit castle",
    width: 1672,
    height: 941,
  },
  {
    id: "sunset",
    src: "/gallery/ukulele-sunset.png",
    alt: "RaioViajante playing ukulele beside the sea at sunset",
    width: 1672,
    height: 941,
  },
  {
    id: "portrait",
    src: "/gallery/purple-portrait.png",
    alt: "A thoughtful purple portrait of the RaioViajante character",
    width: 941,
    height: 1672,
  },
  {
    id: "cats",
    src: "/gallery/playful-cats.png",
    alt: "Three playful black cats against a purple background",
    width: 1536,
    height: 1024,
  },
  {
    id: "calves",
    src: "/gallery/playful-calves.png",
    alt: "Two playful calves in motion",
    width: 1448,
    height: 1086,
  },
  {
    id: "calf",
    src: "/gallery/calf-portrait.png",
    alt: "A small calf sitting against a purple background",
    width: 1536,
    height: 1024,
  },
  {
    id: "mirror",
    src: "/gallery/mirror-reflection.png",
    alt: "RaioViajante looking into a mirror with a goofy reflection",
    width: 1448,
    height: 1086,
  },
  {
    id: "lab",
    src: "/gallery/neon-lab.png",
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
      />
    </a>
  );
}

export function GalleryBoard() {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const frame = window.requestAnimationFrame(() => setRevealed(true));
      return () => window.cancelAnimationFrame(frame);
    }

    const timer = window.setTimeout(() => {
      setRevealed(true);
      window.dispatchEvent(new Event("rv-gallery-reveal"));
    }, 1050);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="gallery-board" data-revealed={revealed}>
      <div className="gallery-opening" aria-hidden={revealed}>
        <Image
          src="/gallery/opening.png"
          alt="RaioViajante's artwork introduction"
          width={1122}
          height={1402}
          priority
        />
      </div>
      {revealed && (
        <div
          className="gallery-collection"
          aria-label="RaioViajante artwork collection"
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
      )}
    </div>
  );
}
