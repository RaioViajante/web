import { render, screen } from "@testing-library/react";

import { SiteHeader } from "@/components/SiteHeader";

jest.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

describe("<SiteHeader />", () => {
  it("exposes the GitHub profile as a single labelled utility link", () => {
    render(<SiteHeader />);

    const link = screen.getByRole("link", { name: "GitHub profile" });
    expect(link).toHaveAttribute("href", "https://github.com/RaioViajante");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noreferrer noopener");
    expect(link).toHaveTextContent("");

    const svg = link.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveAttribute("fill", "currentColor");
  });

  it("keeps the GitHub link out of the primary navigation list", () => {
    const { container } = render(<SiteHeader />);

    expect(
      container.querySelector(".primary-navigation .site-github-link"),
    ).toBeNull();

    // It sits after the nav in document order, so keyboard order stays logical.
    const focusable = Array.from(
      container.querySelectorAll("a, nav"),
    ) as Element[];
    const navIndex = focusable.findIndex((el) =>
      el.classList.contains("primary-navigation"),
    );
    const linkIndex = focusable.findIndex((el) =>
      el.classList.contains("site-github-link"),
    );
    expect(navIndex).toBeGreaterThanOrEqual(0);
    expect(linkIndex).toBeGreaterThan(navIndex);
  });
});
