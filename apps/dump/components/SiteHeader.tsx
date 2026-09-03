import Link from "next/link";

import { PrimaryNavigation } from "@/components/PrimaryNavigation";
import { site } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link href="/" className="site-title">
        {site.name}
      </Link>
      <p className="site-tagline">{site.tagline}</p>
      <PrimaryNavigation />
    </header>
  );
}
