---
contentId: projects/yanawa/design
locale: en
originalLocale: en
path: /projects/yanawa/design/
title: yanawa language design
description: The accepted yanawa decisions, the proposals still being explored, and the questions that are open, area by area.
tagline: What is accepted, what is explored, what is open.
label: language design
order: 1.51
sub: true
group: projects
status: experimental
meta:
  - design record
source: https://github.com/yanawa/yanawa
summary: accepted decisions, exploratory syntax and open questions
---

## How to read this page

yanawa is documented only as design. Each statement below is tagged by where it comes from in the source repository, at commit `7fd082e`:

- Accepted: recorded in `docs/decisions.md` as a decision, with the caveat that it may still evolve.
- Exploratory: described in the other design documents as a possible or preferred direction.
- Open: listed by the documents as unresolved.

Nothing here is implemented. There is no compiler or interpreter to check any of it against.

## Accepted decisions

| Id | Decision | Example |
| --- | --- | --- |
| D001 | Strong static typing, with inference that never weakens guarantees | `let age = 27` is an `int` |
| D002 | Indentation-based blocks, introduced by a colon | `if active:` |
| D003 | No mandatory semicolons | `let name = "Alex"` |
| D004 | `let` declares a mutable variable | `let score = 0` |
| D005 | `const` declares an immutable constant; `const let` is avoided | `const MAX_RETRIES = 3` |
| D006 | A written type follows the name | `let name: str = "Morgan"` |
| D007 | Types are inferred when obvious | `let active = true` |
| D008 | Ordinary types are non-nullable; absence is explicit | `let nickname: str? = none` |
| D009 | Ordinary equality uses `==` | `if name == "Riley":` |
| D010 | Logical operators are the words `and`, `or`, `not` | `if not banned:` |
| D011 | Strings interpolate expressions with braces | `"Hello, {name}"` |
| D012 | Functions use `fn`, with the return type after `->` | `fn add(a: int, b: int) -> int:` |
| D013 | Conditions need no surrounding parentheses | `while running:` |
| D014 | `struct` declares simple structured data | `struct User:` |
| D015 | Familiar syntax is preferred over novelty | no example |
| D016 | Clarity wins over character count | no example |

Together these give the shape of the language: a small, indentation-based syntax in which mutability, nullability and types are visible where they matter.

## Exploratory directions

These appear in the design documents as possible or preferred directions, not as decisions.

### Types, nullability and results

The type documents prefer local inference, a set of primitives that is not final (`str`, `int`, `float`, `bool` and `char` are candidates), and `str` and `str?` as different types. A fallback operator `??` and a `result<T, E>` type with `ok` and `error` constructors are proposed. The exact spelling, the flow analysis for nullable values and the numeric conversion rules are open.

```yanawa
fn divide(a: int, b: int) -> result<int, str>:
    if b == 0:
        return error("Division by zero")
    return ok(a / b)
```

### Structs, enums and traits

Structs are the primary data construct. Construction with named fields, methods declared inside the struct, composition over inheritance, and `trait` with a separate `impl` are the preferred direction. Enums for closed variants, possibly with associated values, are under consideration.

```yanawa
struct User:
    id: int
    name: str
    active: bool = true

trait Printable:
    fn display() -> str
```

### Error handling

Expected failures are meant to be typed values, handled with pattern matching, with `?` as a possible propagation operator. Absence (nullable values) and failure (results) are kept separate. Assertions express programmer assumptions, panic is reserved for unrecoverable states, and exceptions are not the default model.

### Control flow

Conditions use `if`, `elif` and `else`. Loops iterate collections and ranges, with `while` for conditions. A `switch` can produce a value, and a separate `match` for patterns is proposed. Whether both should exist is undecided.

### Concurrency, memory and modules

`async` and `await` with structured concurrency are the preferred direction: child tasks end with their parent scope, cancellation propagates, and detached work requires explicit intent. Ordinary code is meant to be memory safe without manual allocation, but the strategy (garbage collection, ownership, reference counting or a hybrid) is deliberately undecided. Modules are file-oriented with stable module paths instead of long relative imports, and `fn main()` is the entry point candidate.

### Standard library and packages

The standard library is meant to stay small and coherent, organized as importable modules such as `yanawa.fs`, `yanawa.http`, `yanawa.json` and `yanawa.time`. The package system candidate is a single manifest, `yanawa.toml`, with a `yanawa.lock` file, local path dependencies and semantic versioning. A registry is not required for a first compiler.

## Compiler and toolchain direction

The compiler architecture document proposes separate stages with clear boundaries:

```text
source code
  -> lexer -> tokens
  -> parser -> syntax tree
  -> name resolution
  -> type checking
  -> semantic representation
  -> lowering -> intermediate representation
  -> code generation -> target output
```

The same document says not every stage must be a separate subsystem, and that the implementation language, execution target, runtime and intermediate representations are undecided. The tooling document describes one `yanawa` command with subcommands such as `run`, `build`, `check`, `test`, `fmt`, `lint`, `add`, `remove` and `docs`. The README states that these describe intent and are not all implemented, and the repository contains no implementation of any of them.

## Open questions

The documents leave these unresolved, among others:

- Explicit versus implicit return of the final expression.
- The final primitive type set and numeric conversion rules.
- Struct mutability, `self` rules and the scope of `private`.
- Generic syntax and constraints.
- Exact result and propagation semantics.
- The memory strategy and the runtime model.
- The compiler implementation language and compilation targets.
- How much of HTTP, JSON, routes and configuration belongs in the language, the library or the tools.

## References

- [Design decisions](https://github.com/yanawa/yanawa/blob/7fd082e/docs/decisions.md)
- [Syntax](https://github.com/yanawa/yanawa/blob/7fd082e/docs/syntax.md)
- [Type system](https://github.com/yanawa/yanawa/blob/7fd082e/docs/type-system.md)
- [Error handling](https://github.com/yanawa/yanawa/blob/7fd082e/docs/errors.md)
- [Compiler architecture](https://github.com/yanawa/yanawa/blob/7fd082e/docs/compiler-architecture.md)
- [Tooling](https://github.com/yanawa/yanawa/blob/7fd082e/docs/tooling.md)
