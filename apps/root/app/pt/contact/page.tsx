import { ContactPage } from "../../../components/ContactPage";
import { RootShell } from "../../../components/RootShell";
import { metadataFor } from "../../../lib/seo";
import { routes } from "../../../lib/routes";

const path = routes.contact["pt-BR"]!;
export const metadata = metadataFor(path);

export default function ContactPt() {
  return (
    <RootShell current={path} locale="pt-BR">
      <ContactPage locale="pt-BR" />
    </RootShell>
  );
}
