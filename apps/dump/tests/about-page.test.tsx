import AboutPage from "@/app/about/page";

jest.mock("next/navigation", () => ({
  redirect: jest.fn(() => {
    throw new Error("redirect");
  }),
}));

describe("legacy about route", () => {
  it("redirects to the root About page", () => {
    expect(() => AboutPage()).toThrow("redirect");
    const { redirect } = jest.requireMock("next/navigation");
    expect(redirect).toHaveBeenCalledWith("https://raioviajante.com/about");
  });
});
