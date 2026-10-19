import { headers } from "next/headers";
import { jsonLdScript } from "../../../../seo/structured-data";

import { DumpShell } from "@/components/DumpShell";
import { HomePostList } from "@/components/HomePostList";
import { getPostDetails } from "@/lib/post-details";
import { getPublishedPosts } from "@/lib/posts";
import { routes } from "@/lib/routes";
import { staticMetadata } from "@/lib/seo";
import { homeJsonLd } from "@/lib/structured-data";

const locale = "pt-BR" as const;
const path = routes.home[locale]!;

export const metadata = staticMetadata(path);

export default async function HomePagePt() {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  const posts = getPublishedPosts(locale);
  const latest = posts[0];
  return (
    <DumpShell current={path} locale={locale}>
      <script
        nonce={nonce}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(...homeJsonLd()) }}
      />
      <HomePostList
        posts={posts}
        latestMinutes={latest ? getPostDetails(latest).minutes : undefined}
        locale={locale}
      />
    </DumpShell>
  );
}
