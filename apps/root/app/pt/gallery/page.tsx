import "../../gallery/gallery.css";
import { headers } from "next/headers";
import { PageHeader } from "@raioviajante/design/components";
import { jsonLdScript } from "../../../../../seo/structured-data";
import { GalleryBoard } from "../../../components/GalleryBoard";
import { RootShell } from "../../../components/RootShell";
import { ptGallery, ptGalleryCopy } from "../../../lib/pt";
import { metadataFor } from "../../../lib/seo";
import { routes } from "../../../lib/routes";
import { webPageJsonLd } from "../../../lib/structured-data";

const path = routes.gallery["pt-BR"]!;
export const metadata = metadataFor(path);

export default async function GalleryPt() {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  return (
    <RootShell current={path} locale="pt-BR">
      <script
        nonce={nonce}
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript(webPageJsonLd(path, "pt-BR")),
        }}
      />
      <PageHeader
        label={ptGallery.label}
        title={ptGallery.title}
        line={ptGallery.line}
      />
      <GalleryBoard copy={ptGalleryCopy} />
    </RootShell>
  );
}
