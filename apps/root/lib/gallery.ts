import { gallery, galleryBranding } from "@raioviajante/design/gallery";
import { profileLinks, type PrimaryLink } from "./links";

export const categories = [
  {
    id: "branding",
    title: "Branding",
    description:
      "The character, as stickers. Some have a job on these sites: hover to see where.",
    note: "sticker sheet + avatar frames",
  },
  {
    id: "profiles",
    title: "Profiles",
    description: "Where RaioViajante shows up outside these sites.",
    note: "profile pictures",
  },
  {
    id: "personal",
    title: "Personal",
    description: "Drawn for no reason but wanting to. Pinned up as they came.",
    note: "illustrations",
  },
] as const;
export type Category = (typeof categories)[number]["id"];
type Asset = { src: string; width: number; height: number };
export type Artwork = {
  id: string;
  title: string;
  category: Category;
  alt: string;
  use?: string;
  links?: readonly PrimaryLink[];
  image?: Asset;
  cell?: number;
  download?: { src: string; filename: string };
};
const stickerNames = [
  "Work of art",
  "404",
  "Search",
  "TODO",
  "Wink",
  "Oops",
  "Wait, what?",
  "Peeking",
  "Hi!",
  "Thumbs up",
  "To-do",
  "Peeking, with cat",
  "It works!",
  "Focus mode",
  "Couch coding",
  "Serious debugging",
  "Build failed",
  "Idea",
  "Yay",
  "3 a.m.",
  "Checklist",
  "Vibing",
  "Let me explain",
  "Peace",
  "Pair programming",
  "Cat on keyboard",
  "Shower thought",
  "Notes, with help",
  "Best friend",
  "Still compiling",
];
const stickerUses = [
  "gallery cover",
  "404 · every site",
  "search · every site",
  "empty search",
  "favicon",
  "README",
  "profile picture",
];
const slug = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
function piece(
  id: string,
  title: string,
  category: Category,
  image: Asset,
  alt: string,
  use?: string,
  links?: readonly PrimaryLink[],
): Artwork {
  return {
    id,
    title,
    category,
    image,
    alt,
    use,
    links,
    download: {
      src: image.src,
      filename: `raioviajante-${category}-${slug(title)}.${category === "profiles" ? "png" : "webp"}`,
    },
  };
}
export const artworks: readonly Artwork[] = [
  ...stickerNames.map((title, cell): Artwork => ({
    id: `sticker-${cell}`,
    title,
    category: "branding",
    cell,
    alt: `RaioViajante sticker: ${title}`,
    use: stickerUses[cell],
  })),
  piece(
    "profile-laptop",
    "Confused at the laptop",
    "profiles",
    galleryBranding.profileLaptop,
    "RaioViajante scratching his head at a laptop, two question marks beside him",
    undefined,
    profileLinks,
  ),
  piece(
    "profile-hmm",
    "Hmm",
    "profiles",
    galleryBranding.profileHmm,
    "RaioViajante with his hand on his chin, looking up",
  ),
  piece(
    "lab",
    "Neon Code Lab Celebration",
    "personal",
    gallery.laboratory,
    "RaioViajante in a lab coat holding a green flask among glowing tanks labelled with languages",
  ),
  piece(
    "portrait",
    "Melancholic Purple Portrait",
    "personal",
    gallery.purplePortrait,
    "Painted portrait of RaioViajante in a dark shirt on purple",
  ),
  piece(
    "castle",
    "Moonlit Castle Chase",
    "personal",
    gallery.graveyardRun,
    "RaioViajante running through a graveyard toward a castle under a full moon",
  ),
  piece(
    "cow",
    "Muhh",
    "personal",
    gallery.cowMuhh,
    "A fluffy cow saying muhh on purple",
  ),
  piece(
    "cats",
    "Three Playful Cats on Purple",
    "personal",
    gallery.blackCats,
    "Three black cats with orange eyes, one holding a fish",
  ),
  piece(
    "sunset",
    "Ukulele Sunset Beneath the Tree",
    "personal",
    gallery.sunsetGuitar,
    "RaioViajante playing ukulele under a tree at sunset by the sea",
  ),
  piece(
    "calves",
    "Playful Calves in Motion",
    "personal",
    gallery.calvesPlaying,
    "Two calves playing, one jumping",
  ),
  piece(
    "hospital",
    "Tired Patient and Binary Monitor",
    "personal",
    gallery.hospitalBed,
    "RaioViajante in a hospital bed next to a monitor showing binary",
  ),
  piece(
    "mirror",
    "Sad Man, Goofy Mirror Reflection",
    "personal",
    gallery.mirrorDonkey,
    "RaioViajante looking at a mirror that reflects him as a donkey",
  ),
  piece(
    "candle",
    "A Little Light in the Dark",
    "personal",
    gallery.candleRaincoat,
    "A child in a yellow raincoat holding a lit candle beside a lantern in the dark",
  ),
  piece(
    "ferry",
    "The House of Two Cups",
    "personal",
    gallery.ferrymanBoat,
    "RaioViajante in a rowboat with a hooded ferryman, heading toward teacup houses under a full moon, in black and white",
  ),
  piece(
    "forest",
    "Where Stories Are Born",
    "personal",
    gallery.forestLantern,
    "RaioViajante with a lantern in a purple autumn forest, watched by a giant furry creature and small shadow creatures",
  ),
];
/** Replaces `{name}` placeholders; the copy keeps whole sentences so word order can differ. */
export function fill(
  template: string,
  values: Record<string, string | number>,
) {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(values[key]));
}

export type Plural = { one: string; other: string };
export const plural = (forms: Plural, n: number) =>
  fill(n === 1 ? forms.one : forms.other, { n });

/**
 * Every user-facing Gallery string that is not artwork data. Titles are
 * proper names or artistic titles and are never part of the copy. Artwork data
 * is not duplicated per locale: `alts`, `uses`, `stickerAlt` and `linkLabels`
 * only override the English values and are absent for English.
 */
export type GalleryCopy = {
  categories: Record<
    Category,
    { title: string; description: string; note: string }
  >;
  stickerAlt?: string;
  alts?: Record<string, string>;
  uses?: Record<string, string>;
  linkLabels?: Record<string, string>;
  kinds: Record<Category, { type: string; group: string }>;
  ui: {
    sections: string;
    collection: string;
    reveal: string;
    coverAlt: string;
    hintOpen: string;
    hintClosed: string;
    avatar: string;
    avatarFlip: string;
    avatarStill: string;
    avatarMeta: string;
    avatarFrames: string;
    avatarFrame: string;
    view: string;
    profilesOf: string;
    close: string;
    download: string;
    previous: string;
    next: string;
    usedOn: string;
    downloadLabel: string;
    downloadTitle: string;
    downloadIntro: string;
    legend: string;
    files: Plural;
    clear: string;
    selectAll: string;
    saves: string;
    savesFolders: string;
    nothing: string;
    packing: string;
    saved: string;
    failed: string;
    busy: string;
    zip: string;
    zipCount: string;
  };
};

export const galleryCopy: GalleryCopy = {
  categories: Object.fromEntries(
    categories.map(({ id, title, description, note }) => [
      id,
      { title, description, note },
    ]),
  ) as GalleryCopy["categories"],
  kinds: {
    branding: { type: "sticker", group: "branding" },
    profiles: { type: "profile picture", group: "profiles" },
    personal: { type: "personal", group: "personal" },
  },
  ui: {
    sections: "Collection sections",
    collection: "Collection",
    reveal: "Reveal the artwork collection",
    coverAlt: "RaioViajante under a sign that reads work of art",
    hintOpen: "click to put everything back",
    hintClosed: "click the sticker",
    avatar: "Avatar",
    avatarFlip: "Flip RaioViajante avatar",
    avatarStill: "Illustrated RaioViajante character",
    avatarMeta: "index pages · 10 frames",
    avatarFrames: "Avatar animation, ten frames",
    avatarFrame: "Avatar frame {n}",
    view: "View {title}",
    profilesOf: "{title} profiles",
    close: "close",
    download: "download",
    previous: "Previous artwork",
    next: "Next artwork",
    usedOn: "used on",
    downloadLabel: "Download",
    downloadTitle: "Take some art with you",
    downloadIntro: "Pick the categories you want. Only those are saved.",
    legend: "Categories",
    files: { one: "{n} file", other: "{n} files" },
    clear: "clear selection",
    selectAll: "select all",
    saves: "Saves as {filename}.",
    savesFolders: "Saves as {filename}, one folder per category.",
    nothing: "Nothing selected yet.",
    packing: "Packing {i} of {n}…",
    saved: "{filename} saved, {files}.",
    failed: "The collection could not be saved. Please try again.",
    busy: "packing…",
    zip: "download .zip",
    zipCount: "download .zip · {files}",
  },
};

/** An artwork with the locale's alt text, use and profile-link labels; titles and files are unchanged. */
export function localizeArtwork(artwork: Artwork, copy: GalleryCopy): Artwork {
  const use =
    artwork.use === undefined
      ? undefined
      : (copy.uses?.[artwork.use] ?? artwork.use);
  const alt =
    copy.alts?.[artwork.id] ??
    (artwork.cell !== undefined && copy.stickerAlt
      ? fill(copy.stickerAlt, { title: artwork.title })
      : artwork.alt);
  const links = artwork.links?.map((link) => ({
    ...link,
    label: copy.linkLabels?.[link.category] ?? link.label,
  }));
  return { ...artwork, alt, use, links };
}

export function peers(artwork: Artwork) {
  return artworks.filter((item) => item.category === artwork.category);
}
export function stepArtwork(artwork: Artwork, direction: number) {
  const group = peers(artwork);
  return group[
    (group.findIndex((item) => item.id === artwork.id) +
      direction +
      group.length) %
      group.length
  ];
}
export function categoryFiles(category: Category) {
  if (category === "branding")
    return [
      { src: galleryBranding.stickers.src, filename: "stickers.webp" },
      { src: galleryBranding.frames.src, filename: "avatar-frames.webp" },
    ];
  return artworks
    .filter((item) => item.category === category)
    .flatMap((item) => (item.download ? [item.download] : []));
}
