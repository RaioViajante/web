import { render, screen } from "@testing-library/react";

import { PostMeta } from "@/components/PostMeta";

describe("<PostMeta />", () => {
  it("renders a machine-readable date", () => {
    render(<PostMeta date="2026-09-03" />);
    const time = screen.getByText("September 3, 2026");
    expect(time.tagName).toBe("TIME");
    expect(time).toHaveAttribute("dateTime", "2026-09-03");
  });

  it("links each tag to its tag page", () => {
    render(<PostMeta date="2026-09-03" tags={["osdev", "x86"]} />);
    expect(screen.getByRole("link", { name: "osdev" })).toHaveAttribute(
      "href",
      "/tags/osdev",
    );
    expect(screen.getByRole("link", { name: "x86" })).toHaveAttribute(
      "href",
      "/tags/x86",
    );
  });

  it("omits the tag list when there are no tags", () => {
    render(<PostMeta date="2026-09-03" />);
    expect(screen.queryByRole("link")).toBeNull();
  });
});
