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
    heading: "Machines",
    items: [
      {
        name: "Desktop",
        note: "Ryzen 7 5700X3D · 32 GB RAM · Fedora Workstation / Windows 11",
      },
      {
        name: "MacBook Air",
        note: "16 GB memory · 256 GB storage · macOS",
      },
    ],
  },
  {
    heading: "Operating Systems",
    items: [
      { name: "Fedora Workstation", note: "daily driver on the desktop" },
      { name: "macOS", note: "on the MacBook Air" },
      { name: "Windows 11", note: "dual boot on the desktop" },
      { name: "Arch Linux", note: "planned VM on Fedora Workstation" },
    ],
  },
  {
    heading: "Editors",
    items: [
      { name: "Visual Studio Code", note: "main editor" },
      { name: "Vim", note: "for when opening VS Code feels excessive" },
    ],
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
];

export default function UsesPage() {
  return (
    <div className="uses-page">
      <h1 className="uses-heading">Uses</h1>
      <p className="uses-intro">
        A running, incomplete inventory. Updated whenever I remember to.
      </p>
      <p className="uses-aside">
        mostly things I use to convince computers to cooperate.
      </p>
      {/* Flat DOM order (Machines, Operating Systems, Editors, Terminal) is the
          mobile reading order. On wide screens the grid auto-flows the same four
          sections into two columns: left holds Machines + Editors, right holds
          Operating Systems + Terminal. No `order` tricks. */}
      <div className="uses-grid">
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
    </div>
  );
}
