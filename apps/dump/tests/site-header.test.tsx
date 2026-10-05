import { render, screen } from "@testing-library/react";
import { SiteHeader } from "@/components/SiteHeader";

describe("<SiteHeader />", () => {
  it("places the shared sound control above the page", () => {
    render(<SiteHeader />);
    expect(screen.getByRole("button", { name: /Sound off/ })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });
});
