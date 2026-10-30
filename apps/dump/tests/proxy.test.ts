/** @jest-environment node */
import { NextRequest } from "next/server";

import {
  config,
  guardedPath,
  isPublishedDynamicPath,
  proxy,
  type PublishedDynamicPaths,
} from "../proxy";

const encodedTags: PublishedDynamicPaths = {
  en: new Set(["/tags/caf%C3%A9%2Bc%23"]),
  "pt-BR": new Set(["/pt/tags/caf%C3%A9%2Bpt%23", "/pt/tags/pessoal"]),
};

describe("dynamic route guard", () => {
  it("accepts only generated published memberships", () => {
    expect(
      isPublishedDynamicPath("/posts/maybe-this-can-be-something-someday"),
    ).toBe(true);
    expect(isPublishedDynamicPath("/posts/not-real")).toBe(false);
    expect(
      isPublishedDynamicPath("/pt/posts/talvez-isso-vire-alguma-coisa-um-dia"),
    ).toBe(true);
    expect(isPublishedDynamicPath("/pt/tags/pessoal")).toBe(true);
    expect(isPublishedDynamicPath("/pt/posts/building-orbit")).toBe(false);
    expect(isPublishedDynamicPath("/pt/tags/not-real")).toBe(false);
  });

  it("knows every new Portuguese post and tag, with exact tag casing", () => {
    for (const path of [
      "/pt/posts/comecei-a-escrever-as-falhas-antes-das-funcionalidades",
      "/pt/posts/nao-existe-printf-aqui-embaixo",
      "/pt/tags/seguranca",
      "/pt/tags/confiabilidade",
      "/pt/tags/linguagens-de-programacao",
      "/posts/translating-the-site-without-pretending-everything-already-exists",
    ])
      expect(isPublishedDynamicPath(path)).toBe(true);
    // Portuguese tag slugs are exact: no case folding, no English id aliases.
    expect(isPublishedDynamicPath("/pt/tags/Seguranca")).toBe(false);
    expect(isPublishedDynamicPath("/pt/tags/security")).toBe(false);
    expect(isPublishedDynamicPath("/pt/tags/SEGURANCA")).toBe(false);
    // English tag lookup stays case-insensitive.
    expect(isPublishedDynamicPath("/tags/SECURITY")).toBe(true);
    // A Portuguese post slug is not reachable under the English prefix, nor the reverse.
    expect(
      isPublishedDynamicPath("/posts/nao-existe-printf-aqui-embaixo"),
    ).toBe(false);
    expect(
      isPublishedDynamicPath("/pt/posts/there-is-no-printf-down-here"),
    ).toBe(false);
  });

  it("preserves established encoded post and case-insensitive tag forms", () => {
    expect(
      isPublishedDynamicPath("/posts/%6daybe-this-can-be-something-someday"),
    ).toBe(true);
    expect(isPublishedDynamicPath("/tags/OSDEV")).toBe(true);
    expect(isPublishedDynamicPath("/tags/%6f%73%64%65%76")).toBe(true);
    expect(isPublishedDynamicPath("/posts/foo%2Fbar")).toBe(false);
  });

  it("matches encoded tag identities without weakening Portuguese casing", () => {
    expect(isPublishedDynamicPath("/tags/CAF%C3%89%2BC%23", encodedTags)).toBe(
      true,
    );
    expect(
      isPublishedDynamicPath("/pt/tags/caf%C3%A9%2Bpt%23", encodedTags),
    ).toBe(true);
    expect(isPublishedDynamicPath("/pt/tags/%70essoal", encodedTags)).toBe(
      true,
    );
    expect(isPublishedDynamicPath("/pt/tags/PESSOAL", encodedTags)).toBe(false);
    expect(
      isPublishedDynamicPath("/pt/tags/CAF%C3%89%2BPT%23", encodedTags),
    ).toBe(false);
  });

  it.each([
    "/tags/x%2Fy",
    "/tags/x%5Cy",
    "/tags/x%252Fy",
    "/tags/%E0%A4%A",
    "/pt/tags/x%2Fy",
    "/pt/tags/x%252Fy",
  ])("rejects unsafe or ambiguous encoded tag input (%s)", (path) => {
    expect(() => guardedPath(path)).not.toThrow();
    expect(guardedPath(path)).toMatchObject({
      dynamic: true,
      malformed: true,
    });
    expect(isPublishedDynamicPath(path, encodedTags)).toBe(false);
  });

  it.each([
    ["//posts/x", "en"],
    ["/pt//posts/x", "pt-BR"],
    ["/posts/%E0%A4%A", "en"],
    ["/posts/foo%2Fbar", "en"],
  ] as const)(
    "classifies malformed input without throwing (%s)",
    (path, locale) => {
      expect(() => guardedPath(path)).not.toThrow();
      expect(guardedPath(path)).toMatchObject({ locale, malformed: true });
    },
  );

  it.each([
    "/posts/not-real",
    "/posts/not-real/extra",
    "/tags/not-real",
    "/pt/posts/not-real",
    "/pt/posts/not-real/extra",
    "/pt/tags/not-real",
    "//posts/x",
    "/pt//posts/x",
    "/posts/%E0%A4%A",
    "/posts/foo%2Fbar",
    "/posts/not-real/",
  ])(
    "rewrites an invalid dynamic path while preserving its locale (%s)",
    (path) => {
      const request = new NextRequest(`https://dump.raioviajante.com${path}`, {
        headers: { "x-locale": "client-controlled" },
      });
      const response = proxy(request);
      const locale = path.startsWith("/pt/") ? "pt-BR" : "en";
      expect(response.headers.get("x-middleware-request-x-locale")).toBe(
        locale,
      );
      expect(response.headers.get("x-middleware-rewrite")).toBe(
        `https://dump.raioviajante.com${locale === "pt-BR" ? "/pt" : ""}/__dump-not-found`,
      );
    },
  );

  it("does not rewrite a published English post", () => {
    const response = proxy(
      new NextRequest(
        "https://dump.raioviajante.com/posts/maybe-this-can-be-something-someday",
      ),
    );
    expect(response.headers.get("x-middleware-rewrite")).toBeNull();
    expect(response.headers.get("x-middleware-request-x-locale")).toBe("en");
  });

  it("does not rewrite published Portuguese posts or canonical tags", () => {
    for (const path of [
      "/pt/posts/talvez-isso-vire-alguma-coisa-um-dia",
      "/pt/posts/traduzir-o-site-sem-fingir-que-tudo-ja-existe",
      "/pt/tags/pessoal",
      "/pt/tags/arquitetura",
    ]) {
      const response = proxy(
        new NextRequest(`https://dump.raioviajante.com${path}`, {
          headers: { "x-locale": "client-controlled" },
        }),
      );
      expect(response.headers.get("x-middleware-rewrite")).toBeNull();
      expect(response.headers.get("x-middleware-request-x-locale")).toBe(
        "pt-BR",
      );
    }
  });

  it.each([
    "/posts/maybe-this-can-be-something-someday/",
    "/posts/%6daybe-this-can-be-something-someday",
    "/tags/OSDEV",
    "/tags/%6f%73%64%65%76",
  ])("lets Next handle a compatible published route (%s)", (path) => {
    const response = proxy(
      new NextRequest(`https://dump.raioviajante.com${path}`),
    );
    expect(response.headers.get("x-middleware-rewrite")).toBeNull();
    expect(response.headers.get("x-middleware-request-x-locale")).toBe("en");
  });
});

describe("proxy matcher", () => {
  // Next compiles `matcher` entries as `/…` patterns anchored to the whole path.
  const matches = (path: string) =>
    new RegExp(`^${config.matcher[0]}$`).test(path);

  it.each([
    "/rss.xml",
    "/pt/rss.xml",
    "/search-index.json",
    "/pt/search-index.json",
  ])("leaves the static feed or index %s outside the proxy", (path) =>
    expect(matches(path)).toBe(false),
  );

  it.each([
    "/pt/rss.xml/",
    "/rss.xml/extra",
    "/pt/rss.xml.bak",
    "/posts/rss.xml",
    "/pt/posts/rss.xml",
    "/en/rss.xml",
    "/pt/pt/rss.xml",
    "/xrss.xml",
  ])("does not exempt the lookalike %s", (path) =>
    expect(matches(path)).toBe(true),
  );

  it.each([
    "/",
    "/pt",
    "/posts/maybe-this-can-be-something-someday",
    "/pt/posts/talvez-isso-vire-alguma-coisa-um-dia",
    "/pt/tags/pessoal",
    "/tags/osdev",
  ])("still runs the proxy for the page %s", (path) =>
    expect(matches(path)).toBe(true),
  );
});
