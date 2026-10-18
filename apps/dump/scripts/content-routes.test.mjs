import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { collectPublishedRoutes } from "./content-routes.mjs";

const taxonomy = [
  {
    id: "meta",
    locales: {
      en: { label: "meta", slug: "meta" },
      "pt-BR": { label: "meta", slug: "meta" },
    },
  },
];

const record = (draft) => `---
contentId: example
locale: en
originalLocale: en
title: Example
description: Example description.
publishedAt: "2026-01-01"
tags:
  - meta
draft: ${draft}
---

Body.
`;

test("the manifest generator rejects malformed draft metadata", () => {
  const directory = mkdtempSync(join(tmpdir(), "dump-routes-"));
  try {
    writeFileSync(join(directory, "example.mdx"), record('"yes"'));
    assert.throws(
      () => collectPublishedRoutes(directory, taxonomy),
      /`draft` must be a boolean/,
    );
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("the manifest generator uses validated draft state for membership", () => {
  const directory = mkdtempSync(join(tmpdir(), "dump-routes-"));
  try {
    writeFileSync(join(directory, "draft.mdx"), record("true"));
    writeFileSync(
      join(directory, "published.mdx"),
      record("false").replace("contentId: example", "contentId: published"),
    );
    assert.deepEqual(collectPublishedRoutes(directory, taxonomy), {
      posts: { en: ["/posts/published"], "pt-BR": [] },
      tags: { en: ["/tags/meta"], "pt-BR": [] },
    });
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
