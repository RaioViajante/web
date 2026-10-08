import "./gallery.css";
import { metadataFor } from "../../lib/seo";
import { PageHeader } from "@raioviajante/design/components";
import { GalleryBoard } from "../../components/GalleryBoard";
import { RootShell } from "../../components/RootShell";

export const metadata = metadataFor("/gallery");

export default function Gallery() {
  return (
    <RootShell current="/gallery">
      <PageHeader
        label="gallery"
        title="A visual puzzle"
        line="Illustrations, characters and scenes from RaioViajante's world, arranged like a board."
      />
      <GalleryBoard />
    </RootShell>
  );
}
