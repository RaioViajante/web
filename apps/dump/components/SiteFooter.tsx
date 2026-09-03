import Link from "next/link";

import { site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <p>
        {site.tagline}
        {" — "}
        <Link href="/rss.xml">RSS</Link>
      </p>
    </footer>
  );
}
