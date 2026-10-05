import type { Metadata } from "next";
import { GalleryBoard } from "../../components/GalleryBoard";
import { SectionHeading } from "../../components/SectionHeading";

export const metadata: Metadata = { title: "gallery" };

export default function Gallery() {
  return (
    <>
      <div className="rv-hero">
        <p className="rv-eyebrow">gallery</p>
        <h1>A visual puzzle</h1>
        <p className="rv-dek">
          Illustrations, characters and scenes from RaioViajante&apos;s world,
          arranged like a board.
        </p>
      </div>
      <section className="rv-section" aria-labelledby="collection-heading">
        <SectionHeading
          id="collection-heading"
          number="04."
          title="Collection"
        />
        <GalleryBoard />
      </section>
    </>
  );
}
