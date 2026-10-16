/** @jest-environment node */
import { GET } from "@/app/search-index.json/route";
import { getPublishedPosts } from "@/lib/posts";

describe("search-index.json", () => {
  it("publishes the English locale id on every entry and keeps the entry shape", async () => {
    const response = GET();
    expect(response.headers.get("content-type")).toMatch(/^application\/json/);
    const entries = (await response.json()) as Array<Record<string, unknown>>;
    const posts = getPublishedPosts();

    expect(entries.length).toBeGreaterThan(0);
    expect(entries).toHaveLength(posts.length);
    for (const entry of entries) {
      expect(entry.locale).toBe("en");
      expect(entry.site).toBe("dump");
      expect(entry.href).toMatch(
        /^https:\/\/dump\.raioviajante\.com\/posts\/[a-z0-9-]+$/,
      );
      for (const field of ["title", "description", "date", "body"])
        expect(typeof entry[field]).toBe("string");
    }
  });
});
