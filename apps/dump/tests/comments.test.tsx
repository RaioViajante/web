import { renderToString } from "react-dom/server";
import { act, fireEvent, render, screen } from "@testing-library/react";

import { Comments } from "@/components/Comments";

const CONTENT_ID = "maybe-this-can-be-something-someday";
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

describe("<Comments contentId={CONTENT_ID} />", () => {
  beforeEach(() => {
    MockIntersectionObserver.instances = [];
    (
      global as unknown as { IntersectionObserver: unknown }
    ).IntersectionObserver = MockIntersectionObserver;
    document.documentElement.dataset.theme = "light";
  });

  it("renders the container immediately, without loading giscus", () => {
    render(<Comments contentId={CONTENT_ID} />);

    expect(screen.getByTestId("comments")).toBeInTheDocument();
    expect(screen.getByTestId("comments-status")).toHaveRole("status");
    expect(document.querySelector(SCRIPT_SELECTOR)).not.toBeInTheDocument();
  });

  describe("returning from GitHub sign-in", () => {
    afterEach(() => window.history.replaceState(null, "", "/"));

    it("loads giscus immediately, once, when the URL carries ?giscus=", () => {
      window.history.replaceState(null, "", "/posts/x?giscus=token");
      render(<Comments contentId={CONTENT_ID} />);
      // No scroll or intersection needed.
      expect(document.querySelectorAll(SCRIPT_SELECTOR)).toHaveLength(1);
      expect(screen.getByTestId("comments-status")).toHaveRole("status");
      expect(screen.getByTestId("comments-status")).toHaveTextContent(
        "Loading comments",
      );
      // A late intersection must not add a second script.
      const observer = MockIntersectionObserver.instances.at(-1);
      if (observer) act(() => observer.trigger(true));
      expect(document.querySelectorAll(SCRIPT_SELECTOR)).toHaveLength(1);
    });

    it("also loads without IntersectionObserver, with the configuration unchanged", () => {
      delete (global as unknown as { IntersectionObserver?: unknown })
        .IntersectionObserver;
      window.history.replaceState(null, "", "/posts/x?giscus=token");
      render(<Comments contentId={CONTENT_ID} />);
      const script = document.querySelector(SCRIPT_SELECTOR);
      expect(script).toBeInTheDocument();
      expect(script).toHaveAttribute("data-repo", "RaioViajante/web");
      expect(script).toHaveAttribute("data-mapping", "specific");
    });

    it("does not read, copy or change the token or the URL itself", () => {
      window.history.replaceState(null, "", "/posts/x?giscus=token");
      const setItem = jest.spyOn(Storage.prototype, "setItem");
      render(<Comments contentId={CONTENT_ID} />);
      expect(window.location.search).toBe("?giscus=token");
      expect(setItem).not.toHaveBeenCalled();
      setItem.mockRestore();
    });

    it("keeps the lazy behaviour for ordinary visits and unrelated parameters", () => {
      window.history.replaceState(null, "", "/posts/x?ref=feed");
      render(<Comments contentId={CONTENT_ID} />);
      expect(document.querySelector(SCRIPT_SELECTOR)).not.toBeInTheDocument();
    });
  });

  it("shows a local status instead of contacting giscus", () => {
    render(<Comments contentId={CONTENT_ID} />);
    expect(screen.getByTestId("comments-status")).toHaveRole("status");
    expect(screen.getByTestId("comments-status")).toHaveTextContent(
      /when you scroll/,
    );
    expect(document.querySelector("iframe")).not.toBeInTheDocument();
  });

  it("observes with a 200px margin and loads the script only once", () => {
    render(<Comments contentId={CONTENT_ID} />);
    const observer = MockIntersectionObserver.instances.at(-1)!;
    expect(observer.options).toEqual({ rootMargin: "200px" });
    intersectFirst();
    intersectFirst();
    expect(document.querySelectorAll(SCRIPT_SELECTOR)).toHaveLength(1);
    expect(screen.getByTestId("comments-status")).toHaveRole("status");
    expect(screen.getByTestId("comments-status")).toHaveTextContent(
      "Loading comments",
    );
    act(() => {
      document.querySelector(SCRIPT_SELECTOR)!.dispatchEvent(new Event("load"));
    });
    expect(screen.queryByTestId("comments-status")).not.toBeInTheDocument();
  });

  it("without IntersectionObserver waits for an explicit button press", () => {
    delete (global as unknown as { IntersectionObserver?: unknown })
      .IntersectionObserver;
    render(<Comments contentId={CONTENT_ID} />);
    expect(document.querySelector(SCRIPT_SELECTOR)).not.toBeInTheDocument();
    const button = screen.getByTestId("comments-load");
    expect(button).toHaveRole("button");
    expect(button).toHaveAccessibleName("Load comments");
    fireEvent.click(button);
    fireEvent.click(button);
    expect(document.querySelectorAll(SCRIPT_SELECTOR)).toHaveLength(1);
  });

  it("hydrates without IntersectionObserver and offers the button", () => {
    delete (global as unknown as { IntersectionObserver?: unknown })
      .IntersectionObserver;
    const container = document.createElement("div");
    container.innerHTML = renderToString(<Comments contentId={CONTENT_ID} />);
    document.body.appendChild(container);
    render(<Comments contentId={CONTENT_ID} />, { container, hydrate: true });
    expect(screen.getByTestId("comments-load")).toHaveRole("button");
    expect(screen.getByTestId("comments-load")).toHaveAccessibleName(
      "Load comments",
    );
    expect(screen.getByTestId("comments-load")).toBeVisible();
    expect(document.querySelector(SCRIPT_SELECTOR)).not.toBeInTheDocument();
    container.remove();
  });

  it("keeps keyboard focus on the status text after Load comments", () => {
    delete (global as unknown as { IntersectionObserver?: unknown })
      .IntersectionObserver;
    render(<Comments contentId={CONTENT_ID} />);
    const button = screen.getByTestId("comments-load");
    expect(button).toHaveRole("button");
    expect(button).toHaveAccessibleName("Load comments");
    button.focus();
    fireEvent.click(button);
    expect(screen.getByTestId("comments-status")).toHaveRole("status");
    expect(screen.getByTestId("comments-status")).toHaveFocus();
  });

  it("moves focus into the widget when a keyboard reader's load finishes", () => {
    delete (global as unknown as { IntersectionObserver?: unknown })
      .IntersectionObserver;
    render(<Comments contentId={CONTENT_ID} />);
    const button = screen.getByTestId("comments-load");
    expect(button).toHaveRole("button");
    expect(button).toHaveAccessibleName("Load comments");
    button.focus();
    fireEvent.click(button);
    const script = document.querySelector(SCRIPT_SELECTOR)!;
    const frame = document.createElement("iframe");
    script.parentElement!.appendChild(frame);
    act(() => {
      script.dispatchEvent(new Event("load"));
    });
    expect(frame).toHaveFocus();
  });

  it("reports a failed load and allows a retry", () => {
    render(<Comments contentId={CONTENT_ID} />);
    intersectFirst();
    act(() => {
      document
        .querySelector(SCRIPT_SELECTOR)!
        .dispatchEvent(new Event("error"));
    });
    expect(screen.getByTestId("comments-status")).toHaveRole("status");
    expect(screen.getByTestId("comments-status")).toHaveTextContent(
      "could not be loaded",
    );
    expect(screen.getByTestId("comments-retry")).toHaveRole("button");
    expect(screen.getByTestId("comments-retry")).toHaveAccessibleName(
      "Try again",
    );
    fireEvent.click(screen.getByTestId("comments-retry"));
    expect(document.querySelectorAll(SCRIPT_SELECTOR)).toHaveLength(1);
  });

  it("defers loading giscus until the comments area nears the viewport", () => {
    render(<Comments contentId={CONTENT_ID} />);
    expect(document.querySelector(SCRIPT_SELECTOR)).not.toBeInTheDocument();

    intersectFirst();

    expect(document.querySelector(SCRIPT_SELECTOR)).toBeInTheDocument();
  });

  it("configures the RaioViajante/web repository and Comments category", () => {
    render(<Comments contentId={CONTENT_ID} />);
    intersectFirst();

    const script = document.querySelector(SCRIPT_SELECTOR);
    expect(script).toHaveAttribute("data-repo", "RaioViajante/web");
    expect(script).toHaveAttribute("data-repo-id", "R_kgDOUu8oYA");
    expect(script).toHaveAttribute("data-category", "Comments");
    expect(script).toHaveAttribute("data-category-id", "DIC_kwDOUu8oYM4DGx0J");
  });

  it("maps discussions to the work's stable key, strictly", () => {
    render(<Comments contentId={CONTENT_ID} />);
    intersectFirst();

    const script = document.querySelector(SCRIPT_SELECTOR);
    expect(script).toHaveAttribute("data-mapping", "specific");
    expect(script).toHaveAttribute("data-strict", "1");
    expect(script).toHaveAttribute("data-term", `posts/${CONTENT_ID}`);
    expect(script).not.toHaveAttribute("data-mapping", "pathname");
  });

  it("shares one discussion across locales and only changes the interface language", () => {
    const attributes = (locale: "en" | "pt-BR") => {
      const { unmount } = render(
        <Comments contentId={CONTENT_ID} locale={locale} />,
      );
      intersectFirst();
      const script = document.querySelector(SCRIPT_SELECTOR)!;
      const read = Object.fromEntries(
        [...script.attributes]
          .filter((a) => a.name.startsWith("data-"))
          .map((a) => [a.name, a.value]),
      );
      unmount();
      document.querySelector(SCRIPT_SELECTOR)?.remove();
      return read;
    };
    const english = attributes("en");
    const portuguese = attributes("pt-BR");
    expect(english["data-lang"]).toBe("en");
    expect(portuguese["data-lang"]).toBe("pt");
    const { "data-lang": _en, ...englishRest } = english;
    const { "data-lang": _pt, ...portugueseRest } = portuguese;
    expect(portugueseRest).toEqual(englishRest);
  });

  it("derives the term from contentId alone, not the page URL", () => {
    window.history.replaceState(null, "", "/pt/posts/um-slug-localizado");
    render(<Comments contentId="another-work" locale="pt-BR" />);
    intersectFirst();
    expect(document.querySelector(SCRIPT_SELECTOR)).toHaveAttribute(
      "data-term",
      "posts/another-work",
    );
    window.history.replaceState(null, "", "/");
  });

  it("shows Portuguese status text on Portuguese pages", () => {
    render(<Comments contentId={CONTENT_ID} locale="pt-BR" />);
    expect(screen.getByTestId("comments-status")).toHaveRole("status");
    expect(screen.getByTestId("comments-status")).toHaveTextContent(
      /Os comentários carregam/,
    );
  });

  it("keeps giscus minimal: no reactions, no metadata emission", () => {
    render(<Comments contentId={CONTENT_ID} />);
    intersectFirst();

    const script = document.querySelector(SCRIPT_SELECTOR);
    expect(script).toHaveAttribute("data-reactions-enabled", "0");
    expect(script).toHaveAttribute("data-emit-metadata", "0");
  });

  it("loads the custom editorial theme", () => {
    render(<Comments contentId={CONTENT_ID} />);
    intersectFirst();
    expect(document.querySelector(SCRIPT_SELECTOR)).toHaveAttribute(
      "data-theme",
      `${window.location.origin}/giscus.css`,
    );
  });
});
