import { AboutPage } from "../../components/AboutPage";
import { RootShell } from "../../components/RootShell";
import { metadataFor } from "../../lib/seo";
import { routes } from "../../lib/routes";

const path = routes.about.en!;
export const metadata = metadataFor(path);

export default function About() {
  return (
    <RootShell current={path}>
      <AboutPage locale="en" />
    </RootShell>
  );
}
