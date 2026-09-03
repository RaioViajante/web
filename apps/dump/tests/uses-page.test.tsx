import { render, screen } from "@testing-library/react";

import UsesPage from "@/app/uses/page";

describe("<UsesPage />", () => {
  it("renders a semantic, intentionally sparse page shell", () => {
    const { container } = render(<UsesPage />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Uses" }),
    ).toBeInTheDocument();
    expect(container.querySelector(".uses-page")).toBeInTheDocument();
    expect(container.querySelector("p")).not.toBeInTheDocument();
    expect(container.querySelector("section")).not.toBeInTheDocument();
    expect(container.querySelector("dl")).not.toBeInTheDocument();
  });
});
