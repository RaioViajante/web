import { act, render, waitFor } from "@testing-library/react";

import { Comments } from "@/components/Comments";

const SCRIPT_SELECTOR = 'script[src="https://giscus.app/client.js"]';

class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = [];
  callback: IntersectionObserverCallback;
  observe = jest.fn();
  disconnect = jest.fn();
  unobserve = jest.fn();

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
    MockIntersectionObserver.instances.push(this);
  }

  trigger(isIntersecting: boolean) {
    this.callback(
      [{ isIntersecting } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    );
  }
}

function intersectFirst() {
  const observer = MockIntersectionObserver.instances.at(-1);
  if (!observer) throw new Error("No IntersectionObserver was created.");
  act(() => observer.trigger(true));
}

describe("<Comments />", () => {
  beforeEach(() => {
    MockIntersectionObserver.instances = [];
    (
      global as unknown as { IntersectionObserver: unknown }
    ).IntersectionObserver = MockIntersectionObserver;
    document.documentElement.dataset.theme = "light";
  });

  it("renders the quiet rule and container immediately, without loading giscus", () => {
    const { container } = render(<Comments />);

    expect(container.querySelector("hr.comments-rule")).toBeInTheDocument();
    expect(container.querySelector("div.comments")).toBeInTheDocument();
    expect(document.querySelector(SCRIPT_SELECTOR)).not.toBeInTheDocument();
  });

  it("defers loading giscus until the comments area nears the viewport", () => {
    render(<Comments />);
    expect(document.querySelector(SCRIPT_SELECTOR)).not.toBeInTheDocument();

    intersectFirst();

    expect(document.querySelector(SCRIPT_SELECTOR)).toBeInTheDocument();
  });

  it("configures the RaioViajante/dump repository and Comments category", () => {
    render(<Comments />);
    intersectFirst();

    const script = document.querySelector(SCRIPT_SELECTOR);
    expect(script).toHaveAttribute("data-repo", "RaioViajante/dump");
    expect(script).toHaveAttribute("data-repo-id", "R_kgDOUNBnpg");
    expect(script).toHaveAttribute("data-category", "Comments");
    expect(script).toHaveAttribute("data-category-id", "DIC_kwDOUNBnps4DE4Sz");
  });

  it("maps discussions to the article pathname, strictly", () => {
    render(<Comments />);
    intersectFirst();

    const script = document.querySelector(SCRIPT_SELECTOR);
    expect(script).toHaveAttribute("data-mapping", "pathname");
    expect(script).toHaveAttribute("data-strict", "1");
  });

  it("keeps giscus minimal: no reactions, no metadata emission", () => {
    render(<Comments />);
    intersectFirst();

    const script = document.querySelector(SCRIPT_SELECTOR);
    expect(script).toHaveAttribute("data-reactions-enabled", "0");
    expect(script).toHaveAttribute("data-emit-metadata", "0");
  });

  it("selects the borderless light giscus theme when the site is in light mode", () => {
    document.documentElement.dataset.theme = "light";
    render(<Comments />);
    intersectFirst();

    expect(document.querySelector(SCRIPT_SELECTOR)).toHaveAttribute(
      "data-theme",
      "noborder_light",
    );
  });

  it("selects the borderless dark giscus theme when the site is in dark mode", () => {
    document.documentElement.dataset.theme = "dark";
    render(<Comments />);
    intersectFirst();

    expect(document.querySelector(SCRIPT_SELECTOR)).toHaveAttribute(
      "data-theme",
      "noborder_dark",
    );
  });

  it("sends the official setConfig message to the mounted iframe on a live theme change", async () => {
    document.documentElement.dataset.theme = "light";
    render(<Comments />);
    intersectFirst();

    const iframe = document.createElement("iframe");
    iframe.className = "giscus-frame";
    document.body.appendChild(iframe);
    const postMessage = jest.spyOn(iframe.contentWindow!, "postMessage");

    act(() => {
      document.documentElement.dataset.theme = "dark";
    });

    await waitFor(() => {
      expect(postMessage).toHaveBeenCalledWith(
        { giscus: { setConfig: { theme: "noborder_dark" } } },
        "https://giscus.app",
      );
    });

    document.body.removeChild(iframe);
  });
});
