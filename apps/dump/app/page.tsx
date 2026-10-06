import { headers } from "next/headers";
import { jsonLdScript } from "../../../seo/structured-data";

import { staticMetadata } from "@/lib/seo";
import { homeJsonLd } from "@/lib/structured-data";

import { DumpShell } from "@/components/DumpShell";
import { HomePostList } from "@/components/HomePostList";
import { getPostDetails } from "@/lib/post-details";
import { getPublishedPosts } from "@/lib/posts";

export const metadata = staticMetadata("/");

export default async function HomePage() {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  const posts = getPublishedPosts();
  const latest = posts[0];

  return (
    <DumpShell current="/">
      <script
        nonce={nonce}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(...homeJsonLd()) }}
      />
      <HomePostList
        posts={posts}
        latestMinutes={latest ? getPostDetails(latest).minutes : undefined}
      />
    </DumpShell>
  );
}
