import { AboutPage } from "../../../components/AboutPage";
import { RootShell } from "../../../components/RootShell";
import { metadataFor } from "../../../lib/seo";
import { routes } from "../../../lib/routes";

const path = routes.about["pt-BR"]!;
export const metadata = metadataFor(path);

export default function AboutPt() {
  return (
    <RootShell current={path} locale="pt-BR">
      <AboutPage locale="pt-BR" />
    </RootShell>
  );
}
