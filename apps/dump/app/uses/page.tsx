import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Uses",
};

type UsesItem = {
  name: string;
  note?: string;
};

type UsesCategory = {
  heading: string;
  items: UsesItem[];
};

const categories: UsesCategory[] = [
  {
    heading: "Desktop",
    items: [
      { name: "AMD Ryzen 7 5700X3D" },
      { name: "MSI MPG B550 Gaming Plus" },
      { name: "Kingston Fury Beast", note: "32 GB · 3600 MT/s" },
      { name: "Gigabyte GeForce RTX 5070 Aero OC" },
      { name: "Kingston Fury Renegade", note: "2 TB NVMe SSD" },
      { name: "XPG GAMMIX S41", note: "512 GB NVMe SSD" },
      { name: "Seagate ST1000DM003", note: "1 TB HDD" },
      { name: "XPG Core Reactor", note: "850W Gold" },
    ],
  },
  {
    heading: "Laptop",
    items: [{ name: "MacBook Air", note: "16 GB memory · 256 GB storage" }],
  },
  {
    heading: "Displays",
    items: [
      {
        name: "LG UltraGear",
        note: '34" · 3440×1440 WQHD UltraWide · 160 Hz',
      },
      {
        name: "Alienware AW2523HF",
        note: '24.5" · 1920×1080 FHD · 360 Hz',
      },
    ],
  },
  {
    heading: "Keyboards",
    items: [
      { name: "Razer Huntsman V3 Pro TKL" },
      { name: "Razer Huntsman Mini" },
      { name: "Razer BlackWidow X Tournament Edition" },
    ],
  },
  {
    heading: "Mice & Desk",
    items: [
      { name: "Logitech G PRO X SUPERLIGHT" },
      { name: "Fallen Morcego Wireless" },
      { name: "HyperX Pulsefire Mat L" },
    ],
  },
  {
    heading: "Audio",
    items: [{ name: "QCY H3 Pro" }],
  },
  {
    heading: "Camera",
    items: [{ name: "Logitech C920" }],
  },
  {
    heading: "Operating Systems",
    items: [
      { name: "Fedora Workstation" },
      { name: "macOS" },
      { name: "Windows 11" },
    ],
  },
  {
    heading: "Editors",
    items: [{ name: "Visual Studio Code" }, { name: "Vim" }],
  },
  {
    heading: "Terminal",
    items: [
      { name: "Zsh" },
      { name: "Starship" },
      { name: "zoxide" },
      { name: "chezmoi" },
    ],
  },
  {
    heading: "Lab",
    items: [{ name: "Arch Linux", note: "planned VM on Fedora Workstation" }],
  },
  {
    heading: "Consoles",
    items: [
      { name: "PlayStation 2", note: "SCPH-50000NB" },
      { name: "PlayStation 3 Slim", note: "Final Fantasy XIII" },
      { name: "PlayStation 5 Slim", note: "Disc" },
      { name: "Nintendo Switch 2" },
    ],
  },
];

export default function UsesPage() {
  return (
    <div className="uses-page">
      <h1 className="uses-heading">Uses</h1>
      {categories.map((category) => (
        <div className="uses-section" key={category.heading}>
          <h2 className="uses-section-heading">{category.heading}</h2>
          <div className="uses-list">
            {category.items.map((item) => (
              <div className="uses-item" key={item.name}>
                <span className="uses-item-name">{item.name}</span>
                {item.note ? (
                  <span className="uses-item-note">{item.note}</span>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
