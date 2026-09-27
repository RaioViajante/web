import { render, screen } from "@testing-library/react";

import AboutPage from "@/app/about/page";

describe("<AboutPage />", () => {
  it("keeps the editorial prose structure: heading plus plain paragraphs", () => {
    const { container } = render(<AboutPage />);

    expect(
      screen.getByRole("heading", { level: 1, name: "About" }),
    ).toBeInTheDocument();
    expect(container.querySelector(".about-page")).toBeInTheDocument();
    expect(container.querySelector("article")).not.toBeInTheDocument();
    expect(container.querySelector("time")).not.toBeInTheDocument();

    const paragraphs = container.querySelectorAll(".about-page p");
    expect(paragraphs).toHaveLength(5);
  });

  it("opens and closes on the intended lines", () => {
    const { container } = render(<AboutPage />);

    expect(screen.getByText("I’m RaioViajante.")).toBeInTheDocument();

    const last = container.querySelector(".about-page p:last-of-type");
    expect(last).toHaveTextContent("This is where I leave the evidence.");
    // The closing line is a plain paragraph, not a blockquote or aside.
    expect(last?.tagName).toBe("P");
  });
});
