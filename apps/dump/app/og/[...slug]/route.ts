import { socialKey } from "../../../../../seo/metadata";
import { getSeoPages } from "@/lib/seo";
import { site } from "@/lib/site";

export const dynamic = "force-static";
export const dynamicParams = false;

/** One social image per indexed page, rendered at build time. */
export function generateStaticParams() {
  return getSeoPages().map((page) => ({
    slug: socialKey(page.path).split("/"),
  }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string[] }> },
) {
  const { slug } = await params;
  const page = getSeoPages().find(
    (page) => socialKey(page.path) === slug.join("/"),
  );
  if (!page) return new Response("Not found", { status: 404 });
  // Deferred so tests can import the static params without loading Satori.
  const { createSocialImage } =
    await import("@raioviajante/design/social-image");
  return createSocialImage(site.name, page.title, site.url);
}
