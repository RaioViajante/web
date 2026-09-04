import { render, screen } from "@testing-library/react";

import UsesPage from "@/app/uses/page";

describe("<UsesPage />", () => {
  it("keeps the editorial, text-first structure: no cards, tables, or lists", () => {
    const { container } = render(<UsesPage />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Uses" }),
    ).toBeInTheDocument();
    expect(container.querySelector(".uses-page")).toBeInTheDocument();
    expect(container.querySelector("section")).not.toBeInTheDocument();
    expect(container.querySelector("dl")).not.toBeInTheDocument();
    expect(container.querySelector("ul")).not.toBeInTheDocument();
    expect(container.querySelector("table")).not.toBeInTheDocument();
    expect(container.querySelector("img")).not.toBeInTheDocument();
  });

  it("opens with the muted running-inventory line", () => {
    const { container } = render(<UsesPage />);

    const intro = container.querySelector(".uses-intro");
    expect(intro).toHaveTextContent(
      "A running, incomplete inventory. Updated whenever I remember to.",
    );
  });

  it("groups every entry under one of the four relevant categories", () => {
    const { container } = render(<UsesPage />);

    const headings = Array.from(
      container.querySelectorAll(".uses-section-heading"),
    ).map((node) => node.textContent);
    expect(headings).toEqual([
      "Machines",
      "Operating Systems",
      "Editors",
      "Terminal",
    ]);
  });

  it("renders item names with an optional quiet secondary detail", () => {
    const { container } = render(<UsesPage />);

    expect(screen.getByText("Desktop")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Ryzen 7 5700X3D · 32 GB RAM · Fedora Workstation / Windows 11",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText("planned VM on Fedora Workstation"),
    ).toBeInTheDocument();

    // Names are always present; notes are optional (Terminal entries carry none).
    expect(
      container.querySelectorAll(".uses-item-name").length,
    ).toBeGreaterThan(container.querySelectorAll(".uses-item-note").length);
  });
});
