import { gallery, galleryBranding } from "@raioviajante/design/gallery";

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
): Artwork {
  return {
    id,
    title,
    category,
    image,
    alt,
    use,
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
    "YouTube · GitHub · X · Instagram",
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
];
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
