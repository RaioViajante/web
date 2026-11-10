import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { collageSizes, collageSpans } from "../lib/gallery-layout.ts";

const css = readFileSync(
  new URL("../app/gallery/gallery.css", import.meta.url),
  "utf8",
);
const phoneStart = css.indexOf("One large piece, then a pair");
const desktop = css.slice(0, phoneStart);
const phone = css.slice(phoneStart);

test("the collage spans used for image sizes match gallery.css", () => {
  const placed = [
    ...desktop.matchAll(
      /\.gallery-piece--([a-z-]+) \{\s*grid-column: (\d+) \/ (\d+);/g,
    ),
  ];
  assert.deepEqual(
    Object.fromEntries(placed.map(([, id, from, to]) => [id, to - from])),
    Object.fromEntries(
      Object.entries(collageSpans).map(([id, [desktop]]) => [id, desktop]),
    ),
  );
  const fullWidth = phone.slice(0, phone.indexOf("grid-column: 1 / 13;"));
  const phoneDefault = Number(
    /\.gallery-collage \.gallery-piece \{\s*grid-column: span (\d+);/.exec(
      phone,
    )[1],
  );
  for (const [id, [, span]] of Object.entries(collageSpans)) {
    const own = new RegExp(
      `\\.gallery-piece--${id} \\{\\s*grid-column: (\\d+) \\/ (\\d+);`,
    ).exec(phone);
    const expected = own
      ? own[2] - own[1]
      : fullWidth.includes(`.gallery-piece--${id},`)
        ? 12
        : phoneDefault;
    assert.equal(span, expected, id);
  }
});

test("small pieces ask for small images", () => {
  assert.equal(
    collageSizes("midnight"),
    "(max-width: 480px) 46vw, (max-width: 760px) 31vw, 247px",
  );
  assert.equal(
    collageSizes("sunset"),
    "(max-width: 480px) 92vw, (max-width: 760px) 77vw, 617px",
  );
});
