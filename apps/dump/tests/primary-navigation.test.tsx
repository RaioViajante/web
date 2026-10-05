import { render, screen } from "@testing-library/react";

import { PrimaryNavigation } from "@/components/PrimaryNavigation";

let pathname = "/";

jest.mock("next/navigation", () => ({
  usePathname: () => pathname,
}));

describe("<PrimaryNavigation />", () => {
  it("keeps sibling sites and the legacy uses page out of the sidebar", () => {
    pathname = "/";
    render(<PrimaryNavigation />);

    expect(screen.queryByText("Sites")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /uses/i }),
    ).not.toBeInTheDocument();
    expect(screen.getAllByRole("link")).toHaveLength(3);
  });

  it("marks posts as current on the homepage", () => {
    pathname = "/";
    render(<PrimaryNavigation />);

    expect(screen.getByRole("link", { name: "00. posts" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("keeps posts current while reading an article", () => {
    pathname = "/posts/booting-512-bytes";
    render(<PrimaryNavigation />);

    expect(screen.getByRole("link", { name: "00. posts" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("marks a section as current on its nested routes", () => {
    pathname = "/tags/osdev";
    render(<PrimaryNavigation />);

    expect(screen.getByRole("link", { name: "02. tags" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "00. posts" })).not.toHaveAttribute(
      "aria-current",
    );
  });
});
