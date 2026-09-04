import { render, screen } from "@testing-library/react";

import UsesPage from "@/app/uses/page";

describe("<UsesPage />", () => {
  it("keeps the editorial, text-first structure: no cards, tables, or lists", () => {
    const { container } = render(<UsesPage />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Uses" }),
    ).toBeInTheDocument();
    expect(container.querySelector(".uses-page")).toBeInTheDocument();
    expect(container.querySelector("p")).not.toBeInTheDocument();
    expect(container.querySelector("section")).not.toBeInTheDocument();
    expect(container.querySelector("dl")).not.toBeInTheDocument();
    expect(container.querySelector("ul")).not.toBeInTheDocument();
    expect(container.querySelector("table")).not.toBeInTheDocument();
    expect(container.querySelector("img")).not.toBeInTheDocument();
  });

  it("groups every entry under a category heading", () => {
    render(<UsesPage />);

    for (const heading of [
      "Desktop",
      "Laptop",
      "Displays",
      "Keyboards",
      "Mice & Desk",
      "Audio",
      "Camera",
      "Operating Systems",
      "Editors",
      "Terminal",
      "Lab",
      "Consoles",
    ]) {
      expect(
        screen.getByRole("heading", { level: 2, name: heading }),
      ).toBeInTheDocument();
    }
  });

  it("renders an item name with an optional quiet secondary detail", () => {
    const { container } = render(<UsesPage />);

    expect(screen.getByText("AMD Ryzen 7 5700X3D")).toBeInTheDocument();
    expect(screen.getByText("32 GB · 3600 MT/s")).toBeInTheDocument();
    expect(
      screen.getByText("planned VM on Fedora Workstation"),
    ).toBeInTheDocument();

    // Names are always present; notes are optional.
    expect(
      container.querySelectorAll(".uses-item-name").length,
    ).toBeGreaterThan(container.querySelectorAll(".uses-item-note").length);
  });
});
