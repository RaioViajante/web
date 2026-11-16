import {
  createCaseSocialImage,
  createSiteSocialImage,
  createSocialImage,
} from "@raioviajante/design/social-image";
import { socialKey } from "../../../../../seo/metadata";
import { DEFAULT_LOCALE } from "../../../../../site/locales";
import { cases } from "../../../lib/projects";
import { ptHome } from "../../../lib/pt";
import { routeOfPath } from "../../../lib/routes";
import { allPages, notFoundPages, origin } from "../../../lib/seo";
import {
  projectsCopyFor,
  quadraCopyFor,
  stuccoCopyFor,
} from "../../../components/projects/copy";
export const dynamic = "force-static";
export const dynamicParams = false;
export function generateStaticParams() {
  return [...allPages, ...notFoundPages].map((page) => ({
    slug: socialKey(page.path).split("/"),
  }));
}
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string[] }> },
) {
  const { slug } = await params;
  const page = [...allPages, ...notFoundPages].find(
    (page) => socialKey(page.path) === slug.join("/"),
  );
  if (!page) return new Response("Not found", { status: 404 });
  const route = routeOfPath(page.path);
  // The home is the family's card; each case shows its card art.
  if (route?.key === "home")
    return createSiteSocialImage(
      "root",
      route.locale,
      route.locale === DEFAULT_LOCALE
        ? "curious enough to build it myself."
        : ptHome.line,
    );
  const item = cases.find(({ route: key }) => key === route?.key);
  if (route && item) {
    const caseCopy =
      item.id === "stucco"
        ? stuccoCopyFor(route.locale)
        : quadraCopyFor(route.locale);
    return createCaseSocialImage(item.id, {
      kicker: caseCopy.kicker,
      title: item.name,
      line: projectsCopyFor(route.locale).cases[item.id].line,
      address: `${new URL(origin).host}${page.path}`,
    });
  }
  return createSocialImage("raioviajante", page.title, origin);
}
