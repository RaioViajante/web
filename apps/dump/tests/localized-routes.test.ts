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
import { taxonomy } from "@/lib/tags";
import type { DumpSearchEntry } from "@/lib/search-index";
import { blogPostingJsonLd } from "@/lib/structured-data";
import { checkLocaleInventory } from "../../../seo/locale";
import { participates } from "../../../site/locales";

const TRANSLATED_SLUG = "talvez-isso-vire-alguma-coisa-um-dia";
const PORTUGUESE_ORIGINAL_SLUG =
  "traduzir-o-site-sem-fingir-que-tudo-ja-existe";
const PUBLICATION_DATE = "2026-10-19";
const TRANSLATION_DATE = "2026-10-29";

const PORTUGUESE_POST_PATHS = getPublishedPosts("pt-BR").map(
  (post) => `/pt/posts/${post.slug}`,
);
// Every tag id used by a Portuguese post has a Portuguese slug, and a
// Portuguese tag page exists exactly when a Portuguese post carries the tag.
const PORTUGUESE_TAG_PATHS = [
  ...new Set(getPublishedPosts("pt-BR").flatMap((post) => post.tags)),
].map(
  (id) =>
    `/pt/tags/${encodeURIComponent(taxonomy.presentation(id, "pt-BR")!.slug)}`,
);

describe("localized published inventory", () => {
  it("passes reciprocal locale checks and participates in Portuguese", () => {
    expect(checkLocaleInventory("dump", publishedPageInventory())).toEqual([]);
    expect(participates("dump", "pt-BR")).toBe(true);
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

  it("publishes the reviewed Portuguese original and the first translation unchanged", () => {
    const records = getPublishedPosts("pt-BR");
    expect(records.find(({ slug }) => slug === TRANSLATED_SLUG)).toMatchObject({
      contentId: "maybe-this-can-be-something-someday",
      locale: "pt-BR",
      originalLocale: "en",
      title: "Talvez isso vire alguma coisa um dia",
      description:
        "Por que este lugar existe, o que espero que ele se torne e por que provavelmente compliquei demais um diário.",
      publishedAt: PUBLICATION_DATE,
      tags: ["personal", "meta", "dump"],
      draft: false,
    });
    expect(
      records.find(({ slug }) => slug === PORTUGUESE_ORIGINAL_SLUG),
    ).toMatchObject({
      contentId: PORTUGUESE_ORIGINAL_SLUG,
      locale: "pt-BR",
      originalLocale: "pt-BR",
      title: "Traduzir o site sem fingir que tudo já existe",
      description:
        "Como o dump separa identidade, idioma e publicação para oferecer conteúdo parcial em português sem inventar equivalências.",
      publishedAt: PUBLICATION_DATE,
      tags: ["meta", "architecture", "web"],
      draft: false,
    });
  });

  it("links only real counterparts and never invents one", () => {
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
    // The Portuguese original now has a real English translation.
    expect(getPostVersion(PORTUGUESE_ORIGINAL_SLUG, "en")).toMatchObject({
      slug: "translating-the-site-without-pretending-everything-already-exists",
      originalLocale: "pt-BR",
      publishedAt: TRANSLATION_DATE,
    });
    expect(postCounterparts(portugueseOriginal!)).toEqual([
      {
        locale: "en",
        path: "/posts/translating-the-site-without-pretending-everything-already-exists",
      },
    ]);
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
        "/pt/terms",
        "/pt/privacy",
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
    const published = getPublishedPosts("pt-BR");
    expect(entries.map(({ contentId }) => contentId)).toEqual(
      published.map(({ contentId }) => contentId),
    );
    expect(entries.map(({ href }) => new URL(href).pathname)).toEqual(
      PORTUGUESE_POST_PATHS,
    );
    expect(entries.map(({ title }) => title)).toEqual(
      published.map(({ title }) => title),
    );
    expect(new Set(entries.map(({ contentId }) => contentId)).size).toBe(
      entries.length,
    );
    expect(
      entries.find(({ contentId }) => contentId === PORTUGUESE_ORIGINAL_SLUG),
    ).toMatchObject({
      site: "dump",
      locale: "pt-BR",
      title: "Traduzir o site sem fingir que tudo já existe",
      date: PUBLICATION_DATE,
    });
    expect(entries.every(({ body }) => typeof body === "string")).toBe(true);
    expect(entries.every(({ locale }) => locale === "pt-BR")).toBe(true);
  });

  it("emits reciprocal static metadata advertising only the Portuguese RSS feed", () => {
    const metadata = staticMetadata(routes.home["pt-BR"]!);
    expect(metadata.alternates.canonical).toBe("/pt");
    expect(
      Object.fromEntries(
        Object.entries(metadata.alternates.languages ?? {}).map(
          ([language, href]) => [language, new URL(href).pathname],
        ),
      ),
    ).toEqual({ en: "/", "pt-BR": "/pt", "x-default": "/" });
    expect(metadata.alternates.types).toEqual({
      "application/rss+xml": [
        { url: "/pt/rss.xml", title: "dump RSS (português)" },
      ],
    });
    expect(metadata.openGraph).toMatchObject({ locale: "pt_BR" });
  });

  it("derives Portuguese BlogPosting data from the published records", () => {
    const records = getPublishedPosts("pt-BR");
    const translated = records.find(({ slug }) => slug === TRANSLATED_SLUG);
    const portugueseOriginal = records.find(
      ({ slug }) => slug === PORTUGUESE_ORIGINAL_SLUG,
    );
    expect(blogPostingJsonLd(translated!)).toMatchObject({
      "@type": "BlogPosting",
      headline: "Talvez isso vire alguma coisa um dia",
      datePublished: PUBLICATION_DATE,
      url: expect.stringMatching(`/pt/posts/${TRANSLATED_SLUG}$`),
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
