import { act, fireEvent, render, screen } from "@testing-library/react";

import { Comments } from "@/components/Comments";

const SCRIPT_SELECTOR = 'script[src="https://giscus.app/client.js"]';

class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = [];
  callback: IntersectionObserverCallback;
  observe = jest.fn();
  disconnect = jest.fn();
  unobserve = jest.fn();

  options?: IntersectionObserverInit;

  constructor(
    callback: IntersectionObserverCallback,
    options?: IntersectionObserverInit,
  ) {
    this.callback = callback;
    this.options = options;
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

  it("renders the container immediately, without loading giscus", () => {
    const { container } = render(<Comments />);

    expect(container.querySelector("div.comments")).toBeInTheDocument();
    expect(document.querySelector(SCRIPT_SELECTOR)).not.toBeInTheDocument();
  });

  it("shows a local status instead of contacting giscus", () => {
    render(<Comments />);
    expect(screen.getByRole("status")).toHaveTextContent(/when you scroll/);
    expect(document.querySelector("iframe")).not.toBeInTheDocument();
  });

  it("observes with a 200px margin and loads the script only once", () => {
    render(<Comments />);
    const observer = MockIntersectionObserver.instances.at(-1)!;
    expect(observer.options).toEqual({ rootMargin: "200px" });
    intersectFirst();
    intersectFirst();
    expect(document.querySelectorAll(SCRIPT_SELECTOR)).toHaveLength(1);
    expect(screen.getByRole("status")).toHaveTextContent("Loading comments");
    act(() => {
      document.querySelector(SCRIPT_SELECTOR)!.dispatchEvent(new Event("load"));
    });
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("without IntersectionObserver waits for an explicit button press", () => {
    delete (global as unknown as { IntersectionObserver?: unknown })
      .IntersectionObserver;
    render(<Comments />);
    expect(document.querySelector(SCRIPT_SELECTOR)).not.toBeInTheDocument();
    const button = screen.getByRole("button", { name: "Load comments" });
    fireEvent.click(button);
    fireEvent.click(button);
    expect(document.querySelectorAll(SCRIPT_SELECTOR)).toHaveLength(1);
  });

  it("reports a failed load and allows a retry", () => {
    render(<Comments />);
    intersectFirst();
    act(() => {
      document
        .querySelector(SCRIPT_SELECTOR)!
        .dispatchEvent(new Event("error"));
    });
    expect(screen.getByRole("status")).toHaveTextContent("could not be loaded");
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(document.querySelectorAll(SCRIPT_SELECTOR)).toHaveLength(1);
  });

  it("defers loading giscus until the comments area nears the viewport", () => {
    render(<Comments />);
    expect(document.querySelector(SCRIPT_SELECTOR)).not.toBeInTheDocument();

    intersectFirst();

    expect(document.querySelector(SCRIPT_SELECTOR)).toBeInTheDocument();
  });

  it("configures the RaioViajante/web repository and Comments category", () => {
    render(<Comments />);
    intersectFirst();

    const script = document.querySelector(SCRIPT_SELECTOR);
    expect(script).toHaveAttribute("data-repo", "RaioViajante/web");
    expect(script).toHaveAttribute("data-repo-id", "R_kgDOUu8oYA");
    expect(script).toHaveAttribute("data-category", "Comments");
    expect(script).toHaveAttribute("data-category-id", "DIC_kwDOUu8oYM4DGx0J");
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

  it("loads the custom editorial theme", () => {
    render(<Comments />);
    intersectFirst();
    expect(document.querySelector(SCRIPT_SELECTOR)).toHaveAttribute(
      "data-theme",
      `${window.location.origin}/giscus.css`,
    );
  });
});
