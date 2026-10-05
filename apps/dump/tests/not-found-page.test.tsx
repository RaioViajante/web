import { render, screen } from "@testing-library/react";
import NotFound from "@/app/not-found";

describe("<NotFound />", () => {
  it("shows the shared editorial 404 and useful destinations", () => {
    render(<NotFound />);
    expect(
      screen.getByRole("heading", { level: 1, name: "not here" }),
    ).toBeInTheDocument();
    expect(screen.getByText("404")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "dump writing" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(
      screen.getByRole("link", { name: "docs documentation" }),
    ).toHaveAttribute("href", "https://docs.raioviajante.com");
  });
});
