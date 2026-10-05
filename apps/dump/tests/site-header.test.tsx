import { render, screen } from "@testing-library/react";
import { SiteHeader } from "@/components/SiteHeader";

describe("<SiteHeader />", () => {
  it("places the shared sound control above the page", () => {
    render(<SiteHeader />);
    const button = screen.getByRole("button", { name: /Sound off/ });
    expect(button).toHaveAttribute("aria-pressed", "false");
    expect(button.closest(".rv-topline")).toBeInTheDocument();
    expect(button.closest("header.rv-frame")).toBeInTheDocument();
  });
});
