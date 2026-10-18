/** @jest-environment node */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import sitemap, { buildSitemap } from "@/app/sitemap";
import { GET as portugueseSearchIndex } from "@/app/pt/search-index.json/route";
import { publishedPageInventory, postPath, tagPath } from "@/lib/inventory";
import { getAllTags, getPublishedPosts } from "@/lib/posts";
import { routes } from "@/lib/routes";
import { staticMetadata } from "@/lib/seo";
import {
  publishedPostPaths,
  publishedTagPaths,
} from "@/lib/published-routes.generated";
import { checkLocaleInventory } from "../../../seo/locale";
import { participates } from "../../../site/locales";

describe("localized published inventory", () => {
  it("passes reciprocal locale checks and preserves non-participation", () => {
    expect(checkLocaleInventory("dump", publishedPageInventory())).toEqual([]);
    expect(participates("dump", "pt-BR")).toBe(false);
  });

  it("keeps the generated proxy inventory synchronized with published posts and tags", () => {
    for (const locale of ["en", "pt-BR"] as const) {
      expect(new Set(publishedPostPaths[locale])).toEqual(
        new Set(getPublishedPosts(locale).map(postPath)),
      );
      expect(new Set(publishedTagPaths[locale])).toEqual(
        new Set(getAllTags(locale).map(({ slug }) => tagPath(locale, slug))),
      );
    }
  });

  it("publishes Portuguese static routes but no undated post or tag route", () => {
    const paths = sitemap().map(({ url }) => new URL(url).pathname);
    expect(paths).toEqual(
      expect.arrayContaining(["/pt", "/pt/archive", "/pt/tags"]),
    );
    expect(paths).not.toContain("/pt/search");
    expect(paths.some((path) => path.startsWith("/pt/posts/"))).toBe(false);
    expect(paths.some((path) => path.startsWith("/pt/tags/"))).toBe(false);
  });

  it("keeps structural routes indexable when the reviewed publication commit adds Portuguese content", () => {
    const plannedPosts = [
      {
        slug: "talvez-isso-vire-alguma-coisa-um-dia",
        locale: "pt-BR" as const,
      },
      {
        slug: "traduzir-o-site-sem-fingir-que-tudo-ja-existe",
        locale: "pt-BR" as const,
      },
    ];
    const plannedTags = ["pessoal", "meta", "dump", "arquitetura", "web"].map(
      (slug) => ({ locale: "pt-BR" as const, slug }),
    );
    const paths = buildSitemap(plannedPosts, plannedTags).map(
      ({ url }) => new URL(url).pathname,
    );

    expect(paths).toEqual(
      expect.arrayContaining([
        "/pt",
        "/pt/archive",
        "/pt/tags",
        "/pt/posts/talvez-isso-vire-alguma-coisa-um-dia",
        "/pt/posts/traduzir-o-site-sem-fingir-que-tudo-ja-existe",
        "/pt/tags/pessoal",
        "/pt/tags/meta",
        "/pt/tags/dump",
        "/pt/tags/arquitetura",
        "/pt/tags/web",
      ]),
    );
    expect(staticMetadata(routes.home["pt-BR"]!).robots).toBeUndefined();
  });

  it("serves a valid empty Portuguese search index", async () => {
    const response = portugueseSearchIndex();
    expect(response.headers.get("content-type")).toMatch(/^application\/json/);
    expect(await response.json()).toEqual([]);
  });

  it("emits reciprocal metadata without advertising a Portuguese RSS feed", () => {
    const metadata = staticMetadata(routes.home["pt-BR"]!);
    expect(metadata.alternates.canonical).toBe("/pt");
    expect(
      Object.fromEntries(
        Object.entries(metadata.alternates.languages ?? {}).map(
          ([language, href]) => [language, new URL(href).pathname],
        ),
      ),
    ).toEqual({ en: "/", "pt-BR": "/pt", "x-default": "/" });
    expect(metadata.alternates).not.toHaveProperty("types");
    expect(metadata.openGraph).toMatchObject({ locale: "pt_BR" });
  });

  it("keeps undated manuscripts outside the published schema", () => {
    const directory = join(process.cwd(), "content", "drafts", "pt-BR");
    for (const slug of [
      "talvez-isso-vire-alguma-coisa-um-dia",
      "traduzir-o-site-sem-fingir-que-tudo-ja-existe",
    ]) {
      const raw = readFileSync(join(directory, `${slug}.mdx`), "utf8");
      expect(raw).not.toMatch(/^publishedAt:/m);
      expect(raw).not.toContain("OWNER MUST SET");
      expect(raw).toMatch(/^draft: true$/m);
    }
  });
});
