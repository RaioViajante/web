import type { Metadata } from "next";
import Image from "next/image";
import { SectionHeading } from "../../components/SectionHeading";

export const metadata: Metadata = { title: "gallery" };

export default function Gallery() {
  return (
    <>
      <div className="rv-hero">
        <p className="rv-eyebrow">gallery</p>
        <h1>Visual gallery</h1>
        <p className="rv-dek">A home for the visual side of RaioViajante.</p>
      </div>
      <section className="rv-section" aria-labelledby="collection-heading">
        <SectionHeading
          id="collection-heading"
          number="04."
          title="Collection"
        />
        <figure className="gallery-artwork">
          <Image
            src="/avatar.png"
            alt="Illustrated RaioViajante character"
            width={300}
            height={300}
          />
          <figcaption>RaioViajante · character study</figcaption>
        </figure>
      </section>
    </>
  );
}
