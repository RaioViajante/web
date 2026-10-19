/** @jest-environment node */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import sitemap, { buildSitemap } from "@/app/sitemap";
import { GET as portugueseSearchIndex } from "@/app/pt/search-index.json/route";
import {
  postCounterparts,
  publishedPageInventory,
  postPath,
  tagPath,
} from "@/lib/inventory";
import { getAllTags, getPostVersion, getPublishedPosts } from "@/lib/posts";
import {
  publishedPostPaths,
  publishedTagPaths,
} from "@/lib/published-routes.generated";
import { routes } from "@/lib/routes";
import { staticMetadata } from "@/lib/seo";
import type { DumpSearchEntry } from "@/lib/search-index";
import { blogPostingJsonLd } from "@/lib/structured-data";
import { checkLocaleInventory } from "../../../seo/locale";
import { participates } from "../../../site/locales";

const TRANSLATED_SLUG = "talvez-isso-vire-alguma-coisa-um-dia";
const PORTUGUESE_ORIGINAL_SLUG =
  "traduzir-o-site-sem-fingir-que-tudo-ja-existe";
const PUBLICATION_DATE = "2026-10-19";

const PORTUGUESE_POST_PATHS = [
  `/pt/posts/${TRANSLATED_SLUG}`,
  `/pt/posts/${PORTUGUESE_ORIGINAL_SLUG}`,
];
const PORTUGUESE_TAG_PATHS = [
  "/pt/tags/arquitetura",
  "/pt/tags/dump",
  "/pt/tags/meta",
  "/pt/tags/pessoal",
  "/pt/tags/web",
];

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

  it("publishes the exact reviewed Portuguese post records", () => {
    expect(
      getPublishedPosts("pt-BR").map(
        ({
          slug,
          contentId,
          locale,
          originalLocale,
          title,
          description,
          publishedAt,
          tags,
          draft,
        }) => ({
          slug,
          contentId,
          locale,
          originalLocale,
          title,
          description,
          publishedAt,
          tags,
          draft,
        }),
      ),
    ).toEqual([
      {
        slug: TRANSLATED_SLUG,
        contentId: "maybe-this-can-be-something-someday",
        locale: "pt-BR",
        originalLocale: "en",
        title: "Talvez isso vire alguma coisa um dia",
        description:
          "Por que este lugar existe, o que espero que ele se torne e por que provavelmente compliquei demais um diário.",
        publishedAt: PUBLICATION_DATE,
        tags: ["personal", "meta", "dump"],
        draft: false,
      },
      {
        slug: PORTUGUESE_ORIGINAL_SLUG,
        contentId: PORTUGUESE_ORIGINAL_SLUG,
        locale: "pt-BR",
        originalLocale: "pt-BR",
        title: "Traduzir o site sem fingir que tudo já existe",
        description:
          "Como o dump separa identidade, idioma e publicação para oferecer conteúdo parcial em português sem inventar equivalências.",
        publishedAt: PUBLICATION_DATE,
        tags: ["meta", "architecture", "web"],
        draft: false,
      },
    ]);
  });

  it("links only the real translation and invents no English counterpart", () => {
    const translated = getPostVersion(
      "maybe-this-can-be-something-someday",
      "pt-BR",
    );
    const portugueseOriginal = getPostVersion(
      PORTUGUESE_ORIGINAL_SLUG,
      "pt-BR",
    );
    expect(translated).toBeDefined();
    expect(portugueseOriginal).toBeDefined();
    expect(
      getPostVersion("maybe-this-can-be-something-someday", "en"),
    ).toMatchObject({
      slug: "maybe-this-can-be-something-someday",
      contentId: "maybe-this-can-be-something-someday",
      originalLocale: "en",
    });
    expect(postCounterparts(translated!)).toEqual([
      {
        locale: "en",
        path: "/posts/maybe-this-can-be-something-someday",
      },
    ]);
    expect(getPostVersion(PORTUGUESE_ORIGINAL_SLUG, "en")).toBeUndefined();
    expect(postCounterparts(portugueseOriginal!)).toEqual([]);
  });

  it("publishes the exact Portuguese sitemap inventory", () => {
    const paths = sitemap()
      .map(({ url }) => new URL(url).pathname)
      .filter((path) => path === "/pt" || path.startsWith("/pt/"));
    expect(new Set(paths)).toEqual(
      new Set([
        "/pt",
        "/pt/archive",
        "/pt/tags",
        ...PORTUGUESE_POST_PATHS,
        ...PORTUGUESE_TAG_PATHS,
      ]),
    );
    expect(paths).not.toContain("/pt/search");
  });

  it("keeps Portuguese structural routes indexable with published content", () => {
    expect(staticMetadata(routes.home["pt-BR"]!).robots).toBeUndefined();
    expect(staticMetadata(routes.archive["pt-BR"]!).robots).toBeUndefined();
    expect(staticMetadata(routes.tags["pt-BR"]!).robots).toBeUndefined();
  });

  it("uses the shared canonical encoder for sitemap tag URLs", () => {
    const paths = buildSitemap(
      [],
      [
        { locale: "en", slug: "café+c#" },
        { locale: "pt-BR", slug: "café+pt#" },
      ],
    ).map(({ url }) => new URL(url).pathname);

    expect(paths).toEqual(
      expect.arrayContaining([
        "/tags/caf%C3%A9%2Bc%23",
        "/pt/tags/caf%C3%A9%2Bpt%23",
      ]),
    );
  });

  it("serves a locale-pure Portuguese search index with content identities", async () => {
    const response = portugueseSearchIndex();
    expect(response.headers.get("content-type")).toMatch(/^application\/json/);
    const entries = (await response.json()) as DumpSearchEntry[];
    expect(
      entries.map(
        ({ site, locale, contentId, title, href, description, date }) => ({
          site,
          locale,
          contentId,
          title,
          path: new URL(href).pathname,
          description,
          date,
        }),
      ),
    ).toEqual([
      {
        site: "dump",
        locale: "pt-BR",
        contentId: "maybe-this-can-be-something-someday",
        title: "Talvez isso vire alguma coisa um dia",
        path: PORTUGUESE_POST_PATHS[0],
        description:
          "Por que este lugar existe, o que espero que ele se torne e por que provavelmente compliquei demais um diário.",
        date: PUBLICATION_DATE,
      },
      {
        site: "dump",
        locale: "pt-BR",
        contentId: PORTUGUESE_ORIGINAL_SLUG,
        title: "Traduzir o site sem fingir que tudo já existe",
        path: PORTUGUESE_POST_PATHS[1],
        description:
          "Como o dump separa identidade, idioma e publicação para oferecer conteúdo parcial em português sem inventar equivalências.",
        date: PUBLICATION_DATE,
      },
    ]);
    expect(entries.every(({ body }) => typeof body === "string")).toBe(true);
    expect(entries.every(({ locale }) => locale === "pt-BR")).toBe(true);
  });

  it("emits reciprocal static metadata without advertising Portuguese RSS", () => {
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

  it("derives Portuguese BlogPosting data from the published records", () => {
    const [translated, portugueseOriginal] = getPublishedPosts("pt-BR");
    expect(blogPostingJsonLd(translated!)).toMatchObject({
      "@type": "BlogPosting",
      headline: "Talvez isso vire alguma coisa um dia",
      datePublished: PUBLICATION_DATE,
      url: expect.stringMatching(`${PORTUGUESE_POST_PATHS[0]}$`),
      mainEntityOfPage: { inLanguage: "pt-BR" },
      inLanguage: "pt-BR",
      keywords: "pessoal, meta, dump",
      image: expect.stringMatching(`/og/pt/posts/${TRANSLATED_SLUG}\\.png$`),
    });
    expect(blogPostingJsonLd(portugueseOriginal!)).toMatchObject({
      headline: "Traduzir o site sem fingir que tudo já existe",
      datePublished: PUBLICATION_DATE,
      inLanguage: "pt-BR",
      keywords: "meta, arquitetura, web",
    });
  });

  it("moves the reviewed manuscripts into the published collection with the approved date", () => {
    const content = join(process.cwd(), "content");
    for (const slug of [TRANSLATED_SLUG, PORTUGUESE_ORIGINAL_SLUG]) {
      const published = join(content, "posts", `${slug}.mdx`);
      const draft = join(content, "drafts", "pt-BR", `${slug}.mdx`);
      expect(existsSync(published)).toBe(true);
      expect(existsSync(draft)).toBe(false);
      const raw = readFileSync(published, "utf8");
      expect(raw).toMatch(/^publishedAt: "2026-10-19"$/m);
      expect(raw).toMatch(/^draft: false$/m);
      expect(raw).not.toContain("OWNER MUST SET");
    }
  });
});
