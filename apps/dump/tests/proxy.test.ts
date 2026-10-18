/** @jest-environment node */
import { NextRequest } from "next/server";

import { isPublishedDynamicPath, proxy } from "../proxy";

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

  it.each([
    "/posts/not-real",
    "/posts/not-real/extra",
    "/tags/not-real",
    "/pt/posts/not-real",
    "/pt/posts/not-real/extra",
    "/pt/tags/not-real",
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
});
