import Link from "next/link";

import { site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <p>
        {site.name} — {site.author}, 2026. <Link href="/rss.xml">rss</Link>
      </p>
    </footer>
  );
}
