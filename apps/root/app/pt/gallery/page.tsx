import "../../gallery/gallery.css";
import { PageHeader } from "@raioviajante/design/components";
import { GalleryBoard } from "../../../components/GalleryBoard";
import { RootShell } from "../../../components/RootShell";
import { ptGallery, ptGalleryCopy } from "../../../lib/pt";
import { metadataFor } from "../../../lib/seo";
import { routes } from "../../../lib/routes";

const path = routes.gallery["pt-BR"]!;
export const metadata = metadataFor(path);

export default function GalleryPt() {
  return (
    <RootShell current={path} locale="pt-BR">
      <PageHeader
        label={ptGallery.label}
        title={ptGallery.title}
        line={ptGallery.line}
      />
      <GalleryBoard copy={ptGalleryCopy} locale="pt-BR" />
    </RootShell>
  );
}
