// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { attachScroll } from "../scroll";

let stop: (() => void) | undefined;
afterEach(() => {
  stop?.();
  stop = undefined;
  document.body.innerHTML = "";
});

describe("the on-this-page list follows the reader in every locale", () => {
  it.each([
    ["en", "on this page"],
    ["pt-BR", "nesta página"],
  ])("%s: marks a current link by the list's own name", (_locale, name) => {
    document.body.innerHTML = `
      <nav aria-label="${name}"><a href="#one">one</a><a href="#two">two</a></nav>
      <h2 id="one">One</h2><h2 id="two">Two</h2>`;
    stop = attachScroll();
    // jsdom lays nothing out, so every heading is "reached": the last one is current.
    expect(
      [...document.querySelectorAll("nav a.is-current")].map(
        (a) => a.textContent,
      ),
    ).toEqual(["two"]);
  });
});
