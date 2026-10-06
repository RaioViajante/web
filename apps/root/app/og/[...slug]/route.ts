import { createSocialImage } from "@raioviajante/design/social-image";
import { socialKey, notFoundSeo } from "@raioviajante/design/seo";
import { pages, origin } from "../../../lib/seo";
export const dynamic = "force-static";
export const dynamicParams = false;
export function generateStaticParams() {
  return [...pages, notFoundSeo].map((page) => ({
    slug: socialKey(page.path).split("/"),
  }));
}
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string[] }> },
) {
  const { slug } = await params;
  const page = [...pages, notFoundSeo].find(
    (page) => socialKey(page.path) === slug.join("/"),
  );
  if (!page) return new Response("Not found", { status: 404 });
  return createSocialImage("raioviajante", page.title, origin);
}
