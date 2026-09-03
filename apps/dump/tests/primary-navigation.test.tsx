import { render, screen } from "@testing-library/react";

import { PrimaryNavigation } from "@/components/PrimaryNavigation";

let pathname = "/";

jest.mock("next/navigation", () => ({
  usePathname: () => pathname,
}));

describe("<PrimaryNavigation />", () => {
  it("marks posts as current on the homepage", () => {
    pathname = "/";
    render(<PrimaryNavigation />);

    expect(screen.getByRole("link", { name: "posts" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("keeps posts current while reading an article", () => {
    pathname = "/posts/rendering-test";
    render(<PrimaryNavigation />);

    expect(screen.getByRole("link", { name: "posts" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("marks a section as current on its nested routes", () => {
    pathname = "/tags/osdev";
    render(<PrimaryNavigation />);

    expect(screen.getByRole("link", { name: "tags" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "posts" })).not.toHaveAttribute(
      "aria-current",
    );
  });
});
