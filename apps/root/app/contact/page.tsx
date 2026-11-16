import { ContactPage } from "../../components/ContactPage";
import { RootShell } from "../../components/RootShell";
import { metadataFor } from "../../lib/seo";
import { routes } from "../../lib/routes";

const path = routes.contact.en!;
export const metadata = metadataFor(path);

export default function Contact() {
  return (
    <RootShell current={path}>
      <ContactPage locale="en" />
    </RootShell>
  );
}
