import { render, screen } from "@testing-library/react";
import NotFound from "@/app/not-found";

jest.mock("next/headers", () => ({
  headers: async () => new Headers({ "x-locale": "en" }),
}));

describe("<NotFound />", () => {
  it("shows the shared editorial 404 and useful destinations", async () => {
    render(await NotFound());
    expect(
      screen.getByRole("heading", { level: 1, name: "I looked everywhere." }),
    ).toBeInTheDocument();
    expect(screen.getByText("404 · NOT FOUND")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "dump start over" }),
    ).toHaveAttribute("href", "/");
    expect(
      screen.getByRole("link", { name: "raioviajante.com home" }),
    ).toHaveAttribute("href", "https://raioviajante.com");
  });
});
