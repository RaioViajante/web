export interface GearItem {
  name: string;
  category: string;
  url?: string;
}

export const affiliateDisclosure =
  "Some links below are affiliate links. If you buy through them, I may earn a commission at no extra cost to you.";

export const gear: GearItem[] = [
  {
    name: "MacBook Air M5 · 24 GB / 1 TB",
    category: "laptop",
    url: "https://meli.la/2R6XZ9W",
  },
  {
    name: "LG UltraGear 34-inch · 160 Hz",
    category: "monitor",
    url: "https://meli.la/14oybLi",
  },
  { name: "Alienware 24.5-inch · 360 Hz", category: "monitor" },
  {
    name: "Logitech MX Keys Mini",
    category: "keyboard",
    url: "https://meli.la/18eBFdX",
  },
  {
    name: "Apple Magic Mouse",
    category: "mouse",
    url: "https://meli.la/2XY7b3z",
  },
  {
    name: "Apple AirPods Pro 3",
    category: "earbuds",
    url: "https://meli.la/2Gfr7QH",
  },
  { name: "Shure MV6", category: "microphone" },
  { name: "Logitech C920s", category: "webcam" },
  {
    name: "Anker 8-in-1 Dual Monitor Hub",
    category: "hub",
    url: "https://meli.la/2JQoEdC",
  },
  {
    name: "PlayStation 5 Disc Edition",
    category: "console",
    url: "https://meli.la/26HmpkF",
  },
  {
    name: "Nintendo Switch 2",
    category: "console",
    url: "https://meli.la/2oPasc5",
  },
  { name: "PlayStation 3 Final Fantasy XIII", category: "console" },
  { name: "PlayStation 2 Fat", category: "console" },
  { name: "Rozini RX220", category: "acoustic guitar" },
];
