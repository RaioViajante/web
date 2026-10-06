"use client";

import Image from "next/image";
import { useState } from "react";
import { art } from "@raioviajante/design/art";
import { gallery } from "@raioviajante/design/gallery";

const artworks = [
  {
    id: "castle",
    image: gallery.graveyardRun,
    alt: "RaioViajante running from a moonlit castle",
  },
  {
    id: "sunset",
    image: gallery.sunsetGuitar,
    alt: "RaioViajante playing ukulele beside the sea at sunset",
  },
  {
    id: "portrait",
    image: gallery.purplePortrait,
    alt: "A thoughtful purple portrait of the RaioViajante character",
  },
  {
    id: "cats",
    image: gallery.blackCats,
    alt: "Three playful black cats against a purple background",
  },
  {
    id: "calves",
    image: gallery.calvesPlaying,
    alt: "Two playful calves in motion",
  },
  {
    id: "calf",
    image: gallery.cowMuhh,
    alt: "A small calf sitting against a purple background",
  },
  {
    id: "mirror",
    image: gallery.mirrorDonkey,
    alt: "RaioViajante looking into a mirror with a goofy reflection",
  },
  {
    id: "lab",
    image: gallery.laboratory,
    alt: "RaioViajante celebrating in a neon code lab",
  },
  {
    id: "hospital",
    image: gallery.hospitalBed,
    alt: "RaioViajante resting in a hospital bed beside a binary monitor",
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
      href={artwork.image.src}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Open artwork: ${artwork.alt}`}
      data-sound="gallery"
      style={{ animationDelay: `${order * 105}ms` }}
    >
      <Image
        src={artwork.image.src}
        alt={artwork.alt}
        width={artwork.image.width}
        height={artwork.image.height}
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
          src={art.workOfArt.src}
          alt=""
          width={art.workOfArt.width}
          height={art.workOfArt.height}
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
