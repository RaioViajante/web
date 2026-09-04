import fs from "node:fs";
import path from "node:path";

import { render, screen } from "@testing-library/react";

import NotFound from "@/app/not-found";

describe("<NotFound />", () => {
  it("stays server-rendered: no client directive", () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), "app", "not-found.tsx"),
      "utf8",
    );
    expect(source).not.toMatch(/^["']use client["']/m);
  });

  it("uses 'Nothing here.' as the sole page heading, not '404'", () => {
    render(<NotFound />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Nothing here." }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("heading")).toHaveLength(1);
    expect(
      screen.queryByRole("heading", { name: "404" }),
    ).not.toBeInTheDocument();
  });

  it("renders the exact copy", () => {
    render(<NotFound />);

    expect(screen.getByText("404")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Either this page never existed, or I broke something again.",
      ),
    ).toBeInTheDocument();
  });

  it("links back to the homepage with meaningful, visible link text", () => {
    render(<NotFound />);

    const link = screen.getByRole("link", { name: "← back to posts" });
    expect(link).toHaveAttribute("href", "/");
  });

  it("stays free of decoration: no images, icons, or extra navigation", () => {
    const { container } = render(<NotFound />);

    expect(container.querySelectorAll("a")).toHaveLength(1);
    expect(container.querySelector("img")).not.toBeInTheDocument();
    expect(container.querySelector("svg")).not.toBeInTheDocument();
    expect(container.querySelector("button")).not.toBeInTheDocument();
  });
});
