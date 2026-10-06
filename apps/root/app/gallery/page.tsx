import type { Metadata } from "next";
import { PageHeader, Section } from "@raioviajante/design/components";
import { GalleryBoard } from "../../components/GalleryBoard";
import { RootShell } from "../../components/RootShell";

export const metadata: Metadata = { title: "gallery" };

export default function Gallery() {
  return (
    <RootShell current="/gallery">
      <PageHeader
        label="gallery"
        title="A visual puzzle"
        line="Illustrations, characters and scenes from RaioViajante's world, arranged like a board."
      />
      <Section number="04." title="Collection" id="collection-heading">
        <GalleryBoard />
      </Section>
    </RootShell>
  );
}
