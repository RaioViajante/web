import { LOCALE_IDS } from "../../../site/locales";
import { dumpCopy, pluralCategory } from "@/lib/copy";
import { formatPostDate } from "@/lib/posts";
import { routeKeys } from "@/lib/routes";

type Shape = string | readonly Shape[] | { [key: string]: Shape };

/** The structural shape of a catalog: object keys, with leaf kinds. */
function shapeOf(value: unknown): Shape {
  if (typeof value === "function") return "function";
  if (typeof value === "string") return "string";
  // Lists must have the same length; optional per-entry fields may differ.
  if (Array.isArray(value)) return `list of ${value.length}`;
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([k, v]) => [
      k,
      shapeOf(v),
    ]),
  );
}

describe("Dump copy catalog", () => {
  it("has the same keys in every locale", () => {
    const [first, ...rest] = LOCALE_IDS;
    for (const locale of rest)
      expect(shapeOf(dumpCopy(locale))).toEqual(shapeOf(dumpCopy(first!)));
  });

  it("describes every declared route in every locale, with no empty text", () => {
    for (const locale of LOCALE_IDS)
      for (const key of routeKeys) {
        const { title, description } = dumpCopy(locale).pageSeo[key];
        expect(title.trim()).not.toBe("");
        expect(description.trim()).not.toBe("");
      }
  });

  it("does not leave English wording in the Portuguese catalog", () => {
    const pt = dumpCopy("pt-BR");
    const en = dumpCopy("en");
    const visible = (copy: typeof en) => [
      copy.home.empty,
      copy.home.latest,
      copy.home.series,
      copy.home.follow,
      copy.archive.empty,
      copy.archive.title,
      copy.tags.empty,
      copy.tags.recurring,
      copy.tags.once,
      copy.post.published,
      copy.post.keepReading,
      copy.post.related,
      copy.post.labTry,
      copy.post.comments,
      copy.post.commentsPowered,
      ...Object.values(copy.post.commentsUi),
      copy.notFound.line,
    ];
    const english = new Set(visible(en));
    for (const text of visible(pt)) expect(english.has(text)).toBe(false);
  });
});

describe("plural forms", () => {
  it("treats zero as plural and one as singular in both locales", () => {
    expect([0, 1, 2, 5, 21].map((n) => pluralCategory("en", n))).toEqual([
      "other",
      "one",
      "other",
      "other",
      "other",
    ]);
    expect([0, 1, 2, 5, 21].map((n) => pluralCategory("pt-BR", n))).toEqual([
      "other",
      "one",
      "other",
      "other",
      "other",
    ]);
  });

  it("agrees nouns with their counts", () => {
    const en = dumpCopy("en");
    const pt = dumpCopy("pt-BR");
    expect([en.home.parts(1), en.home.parts(2)]).toEqual(["1 part", "2 parts"]);
    expect([pt.home.parts(1), pt.home.parts(2)]).toEqual([
      "1 parte",
      "2 partes",
    ]);
    expect(en.tags.posts(1)).toBe("1 post");
    expect(en.tags.posts(0)).toBe("0 posts");
    expect(pt.tags.posts(1)).toBe("1 texto");
    expect(pt.tags.posts(0)).toBe("0 textos");
    expect(en.archive.since(1, "September 4, 2026")).toBe(
      "1 post since September 4, 2026.",
    );
    expect(pt.archive.since(13, "4 de setembro de 2026")).toBe(
      "13 textos desde 4 de setembro de 2026.",
    );
  });

  it("writes reading time as an invariable abbreviation", () => {
    expect(dumpCopy("en").post.minutesRead(1)).toBe("1 min read");
    expect(dumpCopy("pt-BR").post.minutesRead(1)).toBe("1 min de leitura");
    expect(dumpCopy("pt-BR").post.minutesRead(12)).toBe("12 min de leitura");
  });
});

describe("post dates", () => {
  it("renders long dates in each locale, in UTC", () => {
    expect(formatPostDate("2026-09-27", "en")).toBe("September 27, 2026");
    expect(formatPostDate("2026-09-27", "pt-BR")).toBe(
      "27 de setembro de 2026",
    );
    expect(formatPostDate("2026-01-01", "en")).toBe("January 1, 2026");
    expect(formatPostDate("2026-12-31", "pt-BR")).toBe(
      "31 de dezembro de 2026",
    );
  });
});
