# Content blocks (soft)

The soft blocks shared by dump, docs and lab. They live in `packages/design`:
styles in `styles/blocks.css`, markup and highlighting in `blocks/`, behavior in
`blocks/client.ts`, React components in `components/blocks.tsx`. The visual
reference (`blocks-demo.html`) is in the local design handoff.

## What changes compared to the current implementation

- No border and no header bar on code blocks. The block is a soft surface: `#212121`, `border-radius: 10px`.
- File name and language move **above** the block, outside it (`.block__meta`).
- Copy button floats in the top-right corner and appears on hover (always visible on touch screens).
- Code is tighter: `13.5px / line-height 1.6` (was 1.75). Padding `18px 20px`.
- Line numbers are **off by default**; turn them on only when the post refers to specific lines.
- Same soft surface for callouts, tables, figures and file trees. Only the "careful" and "warning" callouts have an outline ("deprecated" is dotted).
- 28px between prose and any block.

## Markup contract

Every source line is one `<span class="line">` inside `<pre><code>`, with **no newline characters between lines** (numbered and diff lines are flex rows; newlines would add blank lines).

```html
<div class="block [block--numbered] [block--collapsible is-collapsed]">
  <div class="block__meta">
    <span class="block__file">path/file.py</span><span>python</span>
  </div>
  <div class="block__body">
    <button type="button" class="block__copy">copy</button>
    <pre><code><span class="line" data-n="1"><span>…tokens…</span></span>…</code></pre>
  </div>
</div>
```

| block                 | class                                                                                                  | notes                                                      |
| --------------------- | ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------- |
| code                  | `.block`                                                                                               | meta row optional (omit for short snippets)                |
| numbered + highlights | `.block--numbered`, `.line.is-hl`, `data-n`                                                            | highlighted lines: band `#2b2b2b`, bright number           |
| several files         | `.block--tabs`, `.block__tab[aria-selected]`, `[role=tabpanel]`                                        | tabs inside the surface                                    |
| terminal              | `.block--terminal`, `.term-prompt` `.term-cmd` `.term-out` `.term-ok`                                  | darker surface `#161616`; copy takes only `.term-cmd`      |
| diff                  | `.block--diff`, `.line.add`, `.line.del`, `.diff-count`                                                | +/− drawn by CSS                                           |
| annotated             | `.mark` in a line + `ol.block__notes`                                                                  | numbered markers, notes under the code                     |
| collapsed             | `.block--collapsible.is-collapsed` + `.block__more`                                                    | shows 6 lines; use for blocks over 20 lines                |
| callout               | `.callout` (+ `--important`, `--warning`, `--careful`, `--deprecated`, `--til`) with `.callout__label` | labels: Note, Important, Warning, Deprecated, TIL, Careful |
| quote                 | `blockquote` + `cite`, `.pull`                                                                         | pull quote is centered, 22px                               |
| figure                | `figure` + `figcaption`                                                                                | images get the 10px radius                                 |
| table                 | `.table-block > table`                                                                                 | rows only, caps headers                                    |
| file tree             | `.block` with `.tree-branch` `.tree-dir`                                                               |                                                            |
| footnotes             | `sup a` + `ol.footnotes`                                                                               |                                                            |

Syntax tokens use `.tok-keyword .tok-type .tok-function .tok-string .tok-number .tok-comment .tok-punct` (colors in `blocks.css`).

## Markdown and MDX

Use `remark-directive`, then `remarkSoftCallouts` and `rehypeSoftBlocks` from
`@raioviajante/design/blocks`. Fenced code, callouts, tables and footnotes
become the markup above; there is no second implementation. Code is
highlighted at build time with Shiki and a custom theme (`blocks/theme.ts`)
whose colors are the `--syn-*` tokens, rendered as `.tok-*` classes.

````md
```python title="sweep/classify.py"

```

```asm title="boot.asm" showLineNumbers {8-9}

```

```sh terminal
$ nasm -f bin boot.asm -o boot.bin
SeaBIOS …
```

```diff title="sweep/config.py"

```

```python title="rules.py" group="setup"

```

```toml title="sweep.toml" group="setup"

```

```asm note="Pads with zeros up to byte 510." note="The boot signature."
times 510 - ($ - $$) db 0 [!1]
dw 0xAA55 [!2]
```

```tree
project/
├─ src/
│  └─ main.asm
```

:::note
…
:::

:::til[Fun fact]
…
:::

:::careful
…
:::
````

| fence meta          | effect                                                                    |
| ------------------- | ------------------------------------------------------------------------- |
| `title="…"`         | file name above the block                                                 |
| `label="…"`         | language label above the block (default: the fence language)              |
| `showLineNumbers`   | numbered lines (off by default)                                           |
| `{8-9,12}`          | highlighted lines                                                         |
| `terminal`          | terminal block; lines starting with `$ ` are commands, the rest is output |
| `group="…"`         | adjacent fences with the same group become file tabs                      |
| `note="…"` (repeat) | annotated code: notes under the block; mark lines with a trailing `[!n]`  |
| `expanded`          | opt out of auto-collapse                                                  |

- A fence with language `diff` is a diff (`+`/`-` lines), `tree` is a file tree.
- Callout kinds: `note`, `important`, `warning`, `deprecated`, `til`, `careful`. A directive label (`:::til[Fun fact]`) replaces the default label.
- Blocks over 20 lines collapse automatically to 6.
- Outside markdown (Astro pages, React), `highlightBlock()` returns a model and
  `<CodeBlock model={…} />`, `<Callout>`, `<TableBlock>`, `<Figure>` and
  `<Footnotes>` render the same markup.

## Behavior (`blocks/client.ts`)

- **copy** — copies the visible panel's lines; on terminals only the commands. Label turns to `copied` for 1.5s.
- **tabs** — switches `aria-selected` and the matching `hidden` panel; arrow keys, Home and End move between tabs.
- **show all / show less** — toggles `.is-collapsed`, updates the label and `aria-expanded`.

## Done when (per app)

- [ ] No code block on the app has a border or a header bar.
- [ ] Code line height is 1.6 and blocks have a 10px radius.
- [ ] File/language row sits above the block.
- [ ] Copy works for code, tabs and terminals (terminal copies commands only).
- [ ] Numbers only appear when requested; highlighted lines work.
- [ ] Callouts, quotes, tables, figures and footnotes match `blocks-demo.html`.
- [ ] Wide code scrolls inside the block; the page never scrolls sideways on a phone.
