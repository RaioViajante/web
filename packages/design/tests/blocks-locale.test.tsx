// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { join } from "node:path";
import rehypeStringify from "rehype-stringify";
import remarkDirective from "remark-directive";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { renderToStaticMarkup } from "react-dom/server";
import { unified } from "unified";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { LocaleId } from "../../../site/locales";
import { attachBlocks, localizeBlocks } from "../blocks/client";
import { CALLOUT_KINDS } from "../blocks/build";
import { rehypeSoftBlocks, remarkSoftCallouts } from "../blocks/rehype";
import { catalogFor, catalogs } from "../catalog";
import { Callout, CodeBlock, Footnotes } from "../components/blocks";
import { createBlockModel } from "../blocks/model";
import { updateScrollRegion } from "../scroll-regions";

vi.mock("../sound/player", () => ({ playSound: vi.fn() }));

const read = (name: string) =>
  readFileSync(join(import.meta.dirname, "fixtures", name), "utf8");
const sample = read("blocks-sample.md");
/** The sample rendered by the pipeline before localization existed. */
const englishGolden = read("blocks-sample.en.html");

type Plugin = (...args: never[]) => unknown;

async function render(
  markdown: string,
  options?: { locale?: LocaleId },
  frontmatter?: Record<string, unknown>,
  where: "astro" | "matter" | "locale" = "astro",
) {
  const stamp =
    () => (_tree: unknown, file: { data: Record<string, unknown> }) => {
      if (!frontmatter) return;
      if (where === "astro") file.data.astro = { frontmatter };
      else if (where === "matter") file.data.matter = frontmatter;
      else file.data.locale = frontmatter.locale;
    };
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkDirective)
    .use(remarkSoftCallouts)
    .use(remarkRehype)
    .use(stamp as unknown as Plugin as never);
  const withBlocks = options
    ? processor.use(rehypeSoftBlocks, options)
    : processor.use(rehypeSoftBlocks);
  return String(await withBlocks.use(rehypeStringify).process(markdown));
}

describe("English output is unchanged", () => {
  it("renders the full sample byte for byte as before localization", async () => {
    expect(await render(sample)).toBe(englishGolden);
  });

  it("is identical when English is stated by option, frontmatter or vfile data", async () => {
    expect(await render(sample, { locale: "en" })).toBe(englishGolden);
    expect(await render(sample, undefined, { locale: "en" })).toBe(
      englishGolden,
    );
    expect(await render(sample, undefined, { locale: "en" }, "matter")).toBe(
      englishGolden,
    );
    expect(await render(sample, undefined, { locale: "en" }, "locale")).toBe(
      englishGolden,
    );
  });

  it("keeps the public English callout labels", () => {
    expect(CALLOUT_KINDS).toEqual(catalogs.en.blocks.callouts);
  });
});

/** Every English control word or label the markup used to hard-code. */
const ENGLISH_LEFTOVERS = [
  ">copy<",
  ">copy commands<",
  'aria-label="Files"',
  "show all",
  "show less",
  'aria-label="Footnotes"',
  "Back to reference",
  ">Note<",
  ">Important<",
  ">Warning<",
  ">Deprecated<",
  ">TIL<",
  ">Careful<",
  "· lines 2",
  "· line 2",
];

describe("Portuguese build output", () => {
  it("localizes every control and label when the locale is an option", async () => {
    const html = await render(sample, { locale: "pt-BR" });
    for (const text of ENGLISH_LEFTOVERS) expect(html).not.toContain(text);
    expect(html).toContain(">copiar</button>");
    expect(html).toContain(">copiar comandos</button>");
    expect(html).toContain('aria-label="Arquivos"');
    expect(html).toContain("mostrar as 25 linhas");
    expect(html).toContain("python · linhas 2–3");
    expect(html).toContain("python · linha 2");
    expect(html).toContain('aria-label="Notas de rodapé"');
    expect(html).toContain('aria-label="Voltar para a referência 1"');
    const labels = [
      ...html.matchAll(/<span class="callout__label">([^<]*)<\/span>/g),
    ].map((match) => match[1]);
    expect(labels).toEqual([
      "Nota",
      "Importante",
      "Aviso",
      "Obsoleto",
      "Aprendi hoje",
      "Cuidado",
      "Fun fact",
    ]);
  });

  it("keeps an author's own label, code, file names and notes untouched", async () => {
    const html = await render(sample, { locale: "pt-BR" });
    expect(html).toContain(
      '<span class="block__file">sweep/classify.py</span>',
    );
    expect(html).toContain("The first note.");
    expect(html).toContain("Pads with zeros.");
    expect(html).toContain("Fun fact");
  });

  it("reads the locale from Astro frontmatter, gray-matter data or vfile data", async () => {
    const expected = await render(sample, { locale: "pt-BR" });
    expect(await render(sample, undefined, { locale: "pt-BR" })).toBe(expected);
    expect(await render(sample, undefined, { locale: "pt-BR" }, "matter")).toBe(
      expected,
    );
    expect(await render(sample, undefined, { locale: "pt-BR" }, "locale")).toBe(
      expected,
    );
  });

  it("lets the option win over a document's own locale", async () => {
    expect(await render(sample, { locale: "en" }, { locale: "pt-BR" })).toBe(
      englishGolden,
    );
  });

  it("rejects an unsupported locale instead of falling back to English", async () => {
    await expect(render(sample, undefined, { locale: "fr" })).rejects.toThrow(
      /Unsupported document locale/,
    );
  });

  it("names the numbered tab of a panel without a file", async () => {
    const model = await createBlockModel({ code: "a", lang: "text" });
    const unnamed = { ...model, panels: [model.panels[0]!, model.panels[0]!] };
    const { buildBlock } = await import("../blocks/build");
    const pt = JSON.stringify(buildBlock(unnamed, "pt-BR"));
    expect(pt).toContain("arquivo 1");
    expect(pt).toContain("arquivo 2");
    expect(JSON.stringify(buildBlock(unnamed))).toContain("file 2");
  });
});

describe("React components", () => {
  it("render English by default and Portuguese on request", async () => {
    const model = await createBlockModel({ code: "x = 1", lang: "python" });
    const en = renderToStaticMarkup(<CodeBlock model={model} />);
    const pt = renderToStaticMarkup(<CodeBlock model={model} locale="pt-BR" />);
    expect(en).toContain(">copy</button>");
    expect(pt).toContain(">copiar</button>");
    expect(renderToStaticMarkup(<Callout>x</Callout>)).toContain(">Note<");
    expect(renderToStaticMarkup(<Callout locale="pt-BR">x</Callout>)).toContain(
      ">Nota<",
    );
    expect(
      renderToStaticMarkup(
        <Callout locale="pt-BR" label="Por quê">
          x
        </Callout>,
      ),
    ).toContain(">Por quê<");
    const items = [{ id: "n1", content: "texto" }];
    expect(renderToStaticMarkup(<Footnotes items={items} />)).toContain(
      'aria-label="Footnotes"',
    );
    expect(
      renderToStaticMarkup(<Footnotes items={items} locale="pt-BR" />),
    ).toContain('aria-label="Notas de rodapé"');
  });
});

describe("the blocks catalog", () => {
  it("is complete in both locales, with the same callout kinds", () => {
    const en = catalogFor("en").blocks;
    const pt = catalogFor("pt-BR").blocks;
    expect(Object.keys(pt).sort()).toEqual(Object.keys(en).sort());
    expect(Object.keys(pt.callouts).sort()).toEqual(
      Object.keys(en.callouts).sort(),
    );
    for (const [key, value] of Object.entries(pt.callouts))
      expect(value, key).not.toBe(en.callouts[key as keyof typeof en.callouts]);
  });

  it("handles singular and plural line counts in both locales", () => {
    expect(catalogFor("en").blocks.showAll(25)).toBe("show all 25 lines");
    expect(catalogFor("pt-BR").blocks.showAll(25)).toBe("mostrar as 25 linhas");
    expect(catalogFor("pt-BR").blocks.showAll(1)).toBe("mostrar a linha");
    expect(catalogFor("pt-BR").blocks.line(3)).toBe("linha 3");
    expect(catalogFor("pt-BR").blocks.lines(3, 5)).toBe("linhas 3–5");
  });
});

/** The document with the markup of a build, as the behavior sees it. */
function mount(html: string, lang: string) {
  document.documentElement.lang = lang;
  document.body.innerHTML = html;
}

describe("block behavior in jsdom", () => {
  let stop: (() => void) | undefined;
  const writeText = vi.fn(async () => undefined);
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal("navigator", { ...navigator, clipboard: { writeText } });
    writeText.mockClear();
  });
  afterEach(() => {
    stop?.();
    stop = undefined;
    vi.useRealTimers();
    vi.unstubAllGlobals();
    document.body.innerHTML = "";
    document.documentElement.lang = "";
  });

  const text = (selector: string) =>
    document.querySelector(selector)?.textContent;

  async function copyFirst() {
    document.querySelector<HTMLElement>(".block__copy")!.click();
    await vi.advanceTimersByTimeAsync(60);
  }

  it("creates the empty polite status before any copy, and not on pages without blocks", async () => {
    mount("<p>no blocks</p>", "pt-BR");
    stop = attachBlocks();
    expect(document.querySelector("[data-block-status]")).toBeNull();
    stop();
    mount(await render(sample, { locale: "pt-BR" }), "pt-BR");
    stop = attachBlocks();
    const region = document.querySelector('[role="status"][data-block-status]');
    expect(region).not.toBeNull();
    expect(region!.getAttribute("aria-live")).toBe("polite");
    expect(region!.textContent).toBe("");
    // The same node announces later: it was never replaced.
    await copyFirst();
    expect(document.querySelector("[data-block-status]")).toBe(region);
    expect(region!.textContent).toBe("copiado");
  });

  it("creates the status for blocks that arrive after attach", async () => {
    mount("", "pt-BR");
    stop = attachBlocks();
    document.body.insertAdjacentHTML("beforeend", await render(sample));
    await vi.advanceTimersByTimeAsync(0);
    await Promise.resolve();
    expect(document.querySelector("[data-block-status]")).not.toBeNull();
  });

  it("Portuguese: copy feedback is localized, announced politely and restored", async () => {
    mount(await render(sample, { locale: "pt-BR" }), "pt-BR");
    stop = attachBlocks();
    expect(text(".block__copy")).toBe("copiar");
    await copyFirst();
    expect(text(".block__copy")).toBe("copiado");
    expect(document.querySelector(".block__copy.is-copied")).not.toBeNull();
    const status = document.querySelector(
      '[role="status"][data-block-status]',
    )!;
    expect(status.getAttribute("aria-live")).toBe("polite");
    expect(status.textContent).toBe("copiado");
    await vi.advanceTimersByTimeAsync(1600);
    expect(text(".block__copy")).toBe("copiar");
    expect(document.querySelector(".is-copied")).toBeNull();
    expect(status.textContent).toBe("");
  });

  it("Portuguese: a terminal block restores the commands label", async () => {
    mount(
      await render("```sh terminal\n$ ls\nout\n```", { locale: "pt-BR" }),
      "pt-BR",
    );
    stop = attachBlocks();
    await copyFirst();
    expect(text(".block__copy")).toBe("copiado");
    expect(writeText).toHaveBeenCalledWith("ls");
    await vi.advanceTimersByTimeAsync(1600);
    expect(text(".block__copy")).toBe("copiar comandos");
  });

  it("English: unchanged words and announcement", async () => {
    mount(await render(sample), "en");
    stop = attachBlocks();
    expect(text(".block__copy")).toBe("copy");
    await copyFirst();
    expect(text(".block__copy")).toBe("copied");
    expect(text("[data-block-status]")).toBe("copied");
    await vi.advanceTimersByTimeAsync(1600);
    expect(text(".block__copy")).toBe("copy");
  });

  it("expands and collapses with localized labels", async () => {
    mount(await render(sample, { locale: "pt-BR" }), "pt-BR");
    stop = attachBlocks();
    const more = document.querySelector<HTMLButtonElement>(
      ".block__more button",
    )!;
    expect(more.textContent).toBe("mostrar as 25 linhas");
    more.click();
    expect(more.textContent).toBe("mostrar menos");
    expect(more.getAttribute("aria-expanded")).toBe("true");
    more.click();
    expect(more.textContent).toBe("mostrar as 25 linhas");
  });

  it("repaints markup built without a locale from <html lang>, matching a Portuguese build", async () => {
    const english = await render(sample);
    const portuguese = await render(sample, { locale: "pt-BR" });
    mount(english, "pt-BR");
    localizeBlocks();
    const reconciled = document.body.innerHTML;
    mount(portuguese, "pt-BR");
    expect(reconciled).toBe(document.body.innerHTML);
  });

  it("is idempotent, never touches an English page and never touches author labels", async () => {
    const english = await render(sample);
    mount(english, "en");
    const parsed = document.body.innerHTML;
    localizeBlocks();
    expect(document.body.innerHTML).toBe(parsed);
    mount(english, "pt-BR");
    localizeBlocks();
    const once = document.body.innerHTML;
    localizeBlocks();
    expect(document.body.innerHTML).toBe(once);
    expect(once).toContain("Fun fact");
  });

  it("repaints markup that arrives after attach, such as client navigation", async () => {
    mount("", "pt-BR");
    stop = attachBlocks();
    const holder = document.createElement("div");
    holder.innerHTML = await render(sample);
    document.body.append(holder);
    await vi.advanceTimersByTimeAsync(0);
    await Promise.resolve();
    expect(text(".block__copy")).toBe("copiar");
  });

  it("copies and restores in Portuguese even when the markup was built in English", async () => {
    mount(await render(sample), "pt-BR");
    stop = attachBlocks();
    await copyFirst();
    expect(text(".block__copy")).toBe("copiado");
    await vi.advanceTimersByTimeAsync(1600);
    expect(text(".block__copy")).toBe("copiar");
  });

  it("names a sideways-scrolling region in the document's language", () => {
    const region = (lang: string) => {
      document.documentElement.lang = lang;
      document.body.innerHTML = '<div class="table-block"></div>';
      const node = document.body.firstElementChild as HTMLElement;
      Object.defineProperty(node, "scrollWidth", { value: 800 });
      Object.defineProperty(node, "clientWidth", { value: 390 });
      updateScrollRegion(node);
      return node.getAttribute("aria-label");
    };
    expect(region("pt-BR")).toBe("Tabela, rola para o lado");
    expect(region("en")).toBe("Table, scrolls sideways");
    expect(region("")).toBe("Table, scrolls sideways");
  });
});
