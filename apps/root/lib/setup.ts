export interface GearItem {
  name: string;
  category: string;
  url?: string;
}

export const gear: GearItem[] = [
  { name: "MacBook Air M2 · 16 GB", category: "laptop" },
  { name: "Desktop · Ryzen 9 9950X3D / RTX 5070 / 32 GB", category: "desktop" },
  { name: "Alienware 24.5-inch · 360 Hz", category: "monitor" },
  { name: "LG UltraGear ultrawide · 180 Hz", category: "monitor" },
  { name: "Razer Huntsman V3 Pro TKL", category: "keyboard" },
  { name: "Logitech G Pro X Superlight", category: "mouse" },
  { name: "Logitech C920s", category: "webcam" },
  { name: "QCY H3 Pro", category: "headphones" },
  { name: "PlayStation 5 Disc Edition", category: "console" },
  { name: "Nintendo Switch 2", category: "console" },
  { name: "PlayStation 3 Final Fantasy XIII", category: "console" },
  { name: "PlayStation 2 Fat", category: "console" },
];
