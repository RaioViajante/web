/**
 * Derives the Quadra case images from the approved handoff, which stays out
 * of the repository, and writes the module that imports them:
 *
 *   pnpm --filter @raioviajante/design quadra-art <path to the handoff>
 *
 * The handoff folder holds `assets/quadra/` (tour screenshots, brand boards
 * and the card background). Every width is capped below the single-image
 * budget (perf/budgets.json) by lowering the quality. Output never carries the
 * sources' metadata. It also writes the two JPEGs the case's social card
 * draws, since the social renderer reads neither WebP nor srcsets.
 */
import { mkdir, rm, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import sharp from "sharp";

export const ceiling = 140 * 1024;
const target = fileURLToPath(
  new URL("../assets/projects/quadra/", import.meta.url),
);
const moduleFile = fileURLToPath(
  new URL("../components/quadra.ts", import.meta.url),
);

/**
 * The tour, in order: key, source file, the demo's route and the group the
 * caption names. The routes are the demo's own hash routes.
 */
export const tour = {
  desktop: [
    ["login", "desktop-01-login", "#login", "access"],
    ["dashboard", "desktop-02-dashboard", "#dashboard", "overview"],
    ["calendar", "desktop-03-calendar", "#calendar", "calendar"],
    ["drawer", "desktop-04-drawer", "#calendar", "calendar"],
    ["reserve", "desktop-05-reserve", "#reservations", "reservations"],
    ["sent", "desktop-06-sent", "#reservations", "reservations"],
    ["requests", "desktop-07-requests", "#requests", "requests"],
    ["event", "desktop-08-event", "#event-cup", "events"],
    ["new", "desktop-09-new", "#new-event", "events"],
    ["spaces", "desktop-10-spaces", "#spaces", "spaces"],
    ["space", "desktop-11-space", "#space-court", "spaces"],
    ["checkin", "desktop-12-checkin", "#participants", "people"],
    ["analytics", "desktop-13-analytics", "#analytics", "analytics"],
    ["users", "desktop-14-users", "#users", "admin"],
    ["notes", "desktop-15-notes", "#notifications", "admin"],
    ["agenda", "desktop-16-agenda", "#agenda", "public"],
    ["pubevent", "desktop-17-pubevent", "#agenda-cup", "public"],
  ],
  mobile: [
    ["login", "mobile-01-login", "#login", "access"],
    ["dashboard", "mobile-02-dashboard", "#dashboard", "overview"],
    ["calendar", "mobile-03-calendar", "#calendar", "calendar"],
    ["reserve", "mobile-04-reserve", "#reservations", "reservations"],
    ["requests", "mobile-05-requests", "#requests", "requests"],
    ["checkin", "mobile-06-checkin", "#participants", "people"],
    ["analytics", "mobile-07-analytics", "#analytics", "analytics"],
    ["agenda", "mobile-08-agenda", "#agenda", "public"],
    ["pubevent", "mobile-09-pubevent", "#agenda-cup", "public"],
  ],
};

/** The card's slideshow, by tour key: four screens in the browser, four in the phone. */
export const cardSlides = {
  desktop: ["dashboard", "calendar", "requests", "event"],
  mobile: ["login", "dashboard", "agenda", "pubevent"],
};

const brandBoards = [
  ["slots", "board-slots"],
  ["spaces", "board-spaces"],
  ["covers", "board-covers"],
];

async function derive(source, name, width, quality) {
  for (let q = quality; ; q -= 6) {
    const { data, info } = await sharp(source)
      .resize({ width, withoutEnlargement: true, kernel: "lanczos3" })
      .webp({ quality: q, effort: 6 })
      .toBuffer({ resolveWithObject: true });
    if (data.length <= ceiling || q <= 40) {
      if (data.length > ceiling) throw new Error(`${name} is too large`);
      await writeFile(join(target, name), data);
      return { name, width: info.width, height: info.height };
    }
  }
}

async function variants(source, stem, widths, quality) {
  const out = [];
  for (const width of widths)
    out.push(await derive(source, `${stem}-${width}.webp`, width, quality));
  return out;
}

async function jpeg(source, name, width) {
  const data = await sharp(source)
    .resize({ width, withoutEnlargement: true, kernel: "lanczos3" })
    .flatten({ background: "#ffffff" })
    .jpeg({ quality: 80, mozjpeg: true })
    .toBuffer();
  await writeFile(join(target, name), data);
}

const identifier = (name) =>
  name
    .replace(/\.(webp|jpg)$/, "")
    .replace(/[^a-z0-9]+(.)/g, (_, char) => char.toUpperCase());

async function main(handoff) {
  if (!handoff) throw new Error("Pass the path to the handoff folder");
  const source = (...parts) => join(handoff, "assets/quadra", ...parts);
  await rm(target, { recursive: true, force: true });
  await mkdir(target, { recursive: true });
  const imports = [];
  const use = (item) => {
    imports.push(item.name);
    return identifier(item.name);
  };
  const entry = (items) =>
    `image(${items.at(-1).width}, ${items.at(-1).height}, ${items
      .map((item) => `[${use(item)}, ${item.width}]`)
      .join(", ")})`;

  const steps = async (device, widths, thumb) => {
    const out = [];
    for (const [key, file, url, group] of tour[device]) {
      const stem = `${device}-${key}`;
      const full = await variants(
        source("shots", `${file}.webp`),
        stem,
        widths,
        78,
      );
      const [small] = await variants(
        source("shots", `${file}.webp`),
        `${stem}-thumb`,
        [thumb],
        62,
      );
      out.push(
        `{ key: ${JSON.stringify(key)}, url: ${JSON.stringify(url)}, group: ${JSON.stringify(group)}, shot: ${entry(full)}, thumb: ${entry([small])} }`,
      );
    }
    return `[${out.join(", ")}]`;
  };
  const desktop = await steps("desktop", [800, 1440], 240);
  const mobile = await steps("mobile", [320, 640], 120);

  const board = async (file, stem) =>
    entry(
      await variants(source("brand", `${file}.webp`), stem, [800, 1480], 80),
    );
  const cover = await board("identity-cover", "brand-cover");
  const boards = [];
  for (const [key, file] of brandBoards)
    boards.push(
      `{ key: ${JSON.stringify(key)}, image: ${await board(file, `brand-${key}`)} }`,
    );

  const background = entry(
    await variants(
      source("card-background.webp"),
      "card-background",
      [800],
      80,
    ),
  );

  await jpeg(
    source("shots", "desktop-02-dashboard.webp"),
    "social-desktop.jpg",
    960,
  );
  await jpeg(source("shots", "mobile-01-login.webp"), "social-phone.jpg", 320);

  const pick = (device) =>
    `[${cardSlides[device]
      .map((key) => tour[device].findIndex(([k]) => k === key))
      .map((index) => `quadraTour.${device}[${index}].shot`)
      .join(", ")}]`;

  await writeFile(
    moduleFile,
    `// Generated by scripts/quadra-art.mjs; never edit by hand.
// The images of the Quadra case, kept out of every other page's bundle.
${imports.map((name) => `import ${identifier(name)} from "../assets/projects/quadra/${name}";`).join("\n")}

type StaticAsset = string | { src: string };

const url = (asset: StaticAsset) =>
  typeof asset === "string" ? asset : asset.src;

export interface QuadraImage {
  src: string;
  srcSet: string;
  width: number;
  height: number;
}

const image = (
  width: number,
  height: number,
  ...variants: [StaticAsset, number][]
): QuadraImage => ({
  src: url(variants.at(-1)![0]),
  srcSet: variants.map(([asset, w]) => \`\${url(asset)} \${w}w\`).join(", "),
  width,
  height,
});

export const quadraTour = { desktop: ${desktop}, mobile: ${mobile} } as const;
export const quadraBrand = { cover: ${cover}, boards: [${boards.join(", ")}] } as const;
/** The card art: its background and the screens its browser and phone cycle through. */
export const quadraCard = {
  background: ${background},
  desktop: ${pick("desktop")},
  mobile: ${pick("mobile")},
} as const;
`,
  );
  console.log(`${imports.length} images`);
}

if (process.argv[1] === fileURLToPath(import.meta.url))
  await main(process.argv[2]);
