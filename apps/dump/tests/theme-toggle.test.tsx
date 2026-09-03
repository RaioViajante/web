import { fireEvent, render, screen } from "@testing-library/react";

import { ThemeToggle } from "@/components/ThemeToggle";

describe("<ThemeToggle />", () => {
  beforeEach(() => {
    document.documentElement.dataset.theme = "light";
    localStorage.clear();
  });

  it("reflects the theme applied before hydration", async () => {
    const { container } = render(<ThemeToggle />);
    const button = await screen.findByRole("button", {
      name: "Switch to dark theme",
    });

    expect(button).toHaveAttribute("aria-pressed", "false");
    expect(container.querySelector(".theme-icon--sun")).toBeInTheDocument();
    expect(
      container.querySelector(".theme-icon--moon"),
    ).not.toBeInTheDocument();
  });

  it("reflects an initially applied dark theme", async () => {
    document.documentElement.dataset.theme = "dark";
    const { container } = render(<ThemeToggle />);

    const button = await screen.findByRole("button", {
      name: "Switch to light theme",
    });
    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(container.querySelector(".theme-icon--moon")).toBeInTheDocument();
    expect(container.querySelector(".theme-icon--sun")).not.toBeInTheDocument();
  });

  it("switches the theme, icon, and stored preference", async () => {
    const { container } = render(<ThemeToggle />);
    const button = await screen.findByRole("button", {
      name: "Switch to dark theme",
    });

    fireEvent.click(button);

    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    expect(localStorage.getItem("dump-theme")).toBe("dark");
    expect(button).toHaveAccessibleName("Switch to light theme");
    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(container.querySelector(".theme-icon--moon")).toBeInTheDocument();
    expect(container.querySelector(".theme-icon--sun")).not.toBeInTheDocument();

    fireEvent.click(button);

    expect(document.documentElement).toHaveAttribute("data-theme", "light");
    expect(localStorage.getItem("dump-theme")).toBe("light");
    expect(button).toHaveAccessibleName("Switch to dark theme");
  });
});
