import { socialKey } from "../../../../../seo/metadata";
import { getSeoPages, notFoundPages } from "@/lib/seo";
import { dumpCopy } from "@/lib/copy";
import { declaredPages } from "@/lib/routes";
import { site } from "@/lib/site";

export const dynamic = "force-static";
export const dynamicParams = false;

/** One social image per indexed page, rendered at build time. */
export function generateStaticParams() {
  return [...getSeoPages(), ...notFoundPages].map((page) => ({
    slug: socialKey(page.path).split("/"),
  }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string[] }> },
) {
  const { slug } = await params;
  const page = [...getSeoPages(), ...notFoundPages].find(
    (page) => socialKey(page.path) === slug.join("/"),
  );
  if (!page) return new Response("Not found", { status: 404 });
  // Deferred so tests can import the static params without loading Satori.
  const { createSiteSocialImage, createSocialImage } =
    await import("@raioviajante/design/social-image");
  // The home is the family's card; every other page keeps its own.
  const home = declaredPages().find(
    ({ key, path }) => key === "home" && path === page.path,
  );
  if (home)
    return createSiteSocialImage(
      "dump",
      home.locale,
      dumpCopy(home.locale).home.line,
    );
  return createSocialImage(site.name, page.title, site.url);
}
