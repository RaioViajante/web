# Tiny language playground (006)

An educational tokenizer, parser and interpreter for a small subset of the
syntax in yanawa's design notes. **It is not the yanawa compiler.** yanawa is in
its language-design phase and has no verified compiler, so nothing here reuses
one; the page and the record say so.

## Provenance

Pinned to yanawa revision `7fd082e`: `docs/syntax.md` (let, const, fn with typed
parameters and `->`, if/elif/else, while, for over `a..b`, `and`/`or`/`not`,
string interpolation `"{name}"`, `//` comments, indentation blocks) and
`docs/compiler-architecture.md` (tokens, `INDENT`/`DEDENT`, diagnostics that name
the unexpected input, parser recovery at newlines and dedents). The diagnostic
for `fn greet(name str):` follows the notes' own example.

Left out: structs, enums, traits, nullable types, arrays, switch, floats,
imports, errors as values, static type checking (annotations `int`, `str`, `bool`
are checked when the program runs). Rules the notes leave open were chosen here
and listed on the page: the end of `a..b` is excluded, integer division
truncates, spaces only (tabs are a diagnostic).

## Pipeline (`src/lib/tiny-language.ts`)

1. `tokenize`: line by line; indentation levels become `indent`/`dedent` tokens.
2. `parse`: recursive descent. An error is recorded and the parser skips the
   broken line and the block indented under it, then continues, so later errors
   and later good lines are still reported. At most 12 diagnostics.
3. `execute`: a tree-walking interpreter over the AST. Values are JavaScript
   numbers, strings and booleans held in `Map` scopes (so names such as
   `constructor` or `__proto__` are ordinary undefined names). The source is
   never passed to `eval`, `Function`, `import()` or any JavaScript evaluator; a
   test greps the module for them.

## Limits (`LIMITS`)

4,000 characters and 200 lines of source; 3,000 tokens; nesting depth 24; 12
indentation levels; 20,000 evaluation steps; 30 nested calls; 100 output lines
and 4,000 output characters; strings up to 1,000 characters; integers within
the safe range; a trace of the first 200 events. Hitting a limit is a
diagnostic, never a hang or a stack overflow.

## Page

Diagnostics carry a code and arguments; `tiny-language-view.ts` words them from
the locale's catalog (parser contexts and token descriptions are keys, not
English text), with the source line and a caret underline. Plural phrases use
the build-time `oneCountsFor` / `pickForm` pair so the script ships no plural
rules. Editing re-analyzes after 250 ms; running, stepping and the three stages
(tokens, tree, run) are explicit buttons. Output is revealed by trace event, so
`step` shows the output a statement produced.

## Tests

`tests/tiny-language.test.mjs` (tokens, AST shape and precedence, every
statement form, syntax and runtime diagnostics, recovery, limits, oversized and
deeply nested input, hostile identifiers, no-eval guard) and
`tests/tiny-language-copy.test.mjs` (EN/PT parity, every diagnostic worded,
examples, plurals).
