import { render, screen } from "@testing-library/react";

import AboutPage from "@/app/about/page";

describe("<AboutPage />", () => {
  it("renders a semantic, intentionally sparse page shell", () => {
    const { container } = render(<AboutPage />);

    expect(
      screen.getByRole("heading", { level: 1, name: "About" }),
    ).toBeInTheDocument();
    expect(container.querySelector(".about-page")).toBeInTheDocument();
    expect(container.querySelector("p")).not.toBeInTheDocument();
    expect(container.querySelector("article")).not.toBeInTheDocument();
    expect(container.querySelector("time")).not.toBeInTheDocument();
  });
});
