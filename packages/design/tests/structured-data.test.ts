import { describe, expect, it } from "vitest";
import {
  breadcrumbJsonLd,
  identity,
  jsonLdScript,
  personJsonLd,
  personRef,
  sitemapResponse,
  webManifest,
  websiteJsonLd,
} from "../seo";

describe("identity", () => {
  it("is absolute, on the root host, and the single Person id", () => {
    expect(identity.url).toBe("https://raioviajante.com/");
    expect(identity.id).toBe("https://raioviajante.com/#person");
    expect(personRef()["@id"]).toBe(personJsonLd()["@id"]);
    expect(personJsonLd().sameAs).toEqual(["https://github.com/RaioViajante"]);
    // Nothing beyond name, url and the profile is published.
    expect(Object.keys(personJsonLd()).sort()).toEqual([
      "@id",
      "@type",
      "name",
      "sameAs",
      "url",
    ]);
  });

  it("builds a WebSite that references the person", () => {
    const site = websiteJsonLd("https://lab.raioviajante.com", "lab", "d");
    expect(site["@id"]).toBe("https://lab.raioviajante.com/#website");
    expect(site.url).toBe("https://lab.raioviajante.com/");
    expect(site.author["@id"]).toBe(identity.id);
    expect(site).not.toHaveProperty("potentialAction");
  });
});

describe("JSON-LD", () => {
  it("serializes one parseable graph and cannot close its script element", () => {
    const body = jsonLdScript({ "@type": "Thing", name: "</script><b>" });
    expect(body).not.toContain("<");
    expect(JSON.parse(body)).toEqual({
      "@context": "https://schema.org",
      "@graph": [{ "@type": "Thing", name: "</script><b>" }],
    });
  });

  it("numbers breadcrumbs and makes the URLs absolute", () => {
    const list = breadcrumbJsonLd("https://docs.raioviajante.com", [
      ["docs", "/"],
      ["Sweep", "/projects/sweep/"],
    ]);
    expect(list.itemListElement.map((item) => item.position)).toEqual([1, 2]);
    expect(list.itemListElement[1]!.item).toBe(
      "https://docs.raioviajante.com/projects/sweep/",
    );
  });
});

describe("sitemap", () => {
  it("emits lastmod only for entries that have one", async () => {
    const xml = await sitemapResponse("https://x.example", [
      "/a",
      { path: "/b", lastmod: "2026-09-07" },
    ]).text();
    expect(xml).toContain("<loc>https://x.example/a</loc></url>");
    expect(xml).toContain(
      "<loc>https://x.example/b</loc><lastmod>2026-09-07</lastmod>",
    );
    expect(xml.match(/<lastmod>/g)).toHaveLength(1);
  });
});

describe("manifest", () => {
  it("names the site and colors without claiming an app shell", () => {
    const manifest = webManifest("docs", { themeColor: "#191919" });
    expect(manifest.display).toBe("browser");
    expect(manifest.theme_color).toBe("#191919");
    expect(manifest.background_color).toBe("#191919");
    expect(webManifest("docs")).not.toHaveProperty("theme_color");
    expect(manifest).not.toHaveProperty("scope");
  });
});
