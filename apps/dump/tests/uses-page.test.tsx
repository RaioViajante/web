import UsesPage from "@/app/uses/page";

jest.mock("next/navigation", () => ({
  redirect: jest.fn(() => {
    throw new Error("redirect");
  }),
}));

describe("legacy uses route", () => {
  it("redirects to the Root setup page", () => {
    expect(() => UsesPage()).toThrow("redirect");
    const { redirect } = jest.requireMock("next/navigation");
    expect(redirect).toHaveBeenCalledWith("https://raioviajante.com/setup");
  });
});
