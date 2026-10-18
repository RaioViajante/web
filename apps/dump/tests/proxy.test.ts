/** @jest-environment node */
import { NextRequest } from "next/server";

import { guardedPath, isPublishedDynamicPath, proxy } from "../proxy";

describe("dynamic route guard", () => {
  it("accepts only generated published memberships", () => {
    expect(
      isPublishedDynamicPath("/posts/maybe-this-can-be-something-someday"),
    ).toBe(true);
    expect(isPublishedDynamicPath("/posts/not-real")).toBe(false);
    expect(
      isPublishedDynamicPath("/pt/posts/talvez-isso-vire-alguma-coisa-um-dia"),
    ).toBe(false);
    expect(isPublishedDynamicPath("/pt/tags/pessoal")).toBe(false);
  });

  it("preserves established encoded post and case-insensitive tag forms", () => {
    expect(
      isPublishedDynamicPath("/posts/%6daybe-this-can-be-something-someday"),
    ).toBe(true);
    expect(isPublishedDynamicPath("/tags/OSDEV")).toBe(true);
    expect(isPublishedDynamicPath("/tags/%6f%73%64%65%76")).toBe(true);
    expect(isPublishedDynamicPath("/posts/foo%2Fbar")).toBe(false);
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
