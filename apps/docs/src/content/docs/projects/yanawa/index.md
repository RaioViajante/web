---
contentId: projects/yanawa
locale: en
originalLocale: en
path: /projects/yanawa/
title: yanawa
description: An experimental, strongly typed application language under design. What is decided, what is only direction, and what does not exist yet.
tagline: A strongly typed language for applications, still on paper.
order: 1.5
group: projects
status: experimental
meta:
  - language design
source: https://github.com/yanawa/yanawa
summary: strongly typed application language, in design
---

## Overview

yanawa is an experimental, strongly typed programming language for building applications with less ceremony. Its stated aim is strong static guarantees without making the programmer repeat what the compiler already knows, and a first-party toolchain that treats formatting, testing, diagnostics and dependencies as one system.

The name is written in lowercase everywhere: `yanawa`.

:::important
yanawa has no compiler, interpreter, runtime, grammar file or package ecosystem. The source repository contains design documents and nothing else, so no yanawa program can be run today.
:::

## Current state

Every claim on this page comes from the design documents in the source repository, checked at commit `7fd082e`. The repository holds 16 commits, all of them documentation, and six closed issues that define the language's identity.

| Area | State | Evidence |
| --- | --- | --- |
| Language identity and principles | accepted | `docs/language-identity.md`, `docs/philosophy.md` |
| Sixteen syntax and semantics decisions | accepted, may still change | `docs/decisions.md` (D001 to D016) |
| Types, errors, objects, modules | direction, with open questions | `docs/type-system.md`, `docs/errors.md`, `docs/object-model.md`, `docs/modules.md` |
| Memory, concurrency, standard library, packages | direction, largely undecided | `docs/memory-model.md`, `docs/concurrency.md`, `docs/standard-library.md`, `docs/package-system.md` |
| Compiler pipeline and toolchain | proposed architecture, nothing built | `docs/compiler-architecture.md`, `docs/tooling.md` |
| Lexer, parser, type checker, code generator | not started in the repository | no source files exist |
| `yanawa` command | not implemented | no source files exist |

A decision marked accepted records an intended direction. The project itself says it may still evolve while the language is experimental.

## Philosophy

The documents describe a handful of principles that new proposals are measured against:

- Clarity over cleverness: code should be understandable before it is impressive.
- Strong typing without excessive syntax: inference may hide what is derivable, never what is meaningful.
- Familiar before novel: new syntax needs a clear gain in clarity, safety or consistency.
- Safe by default: ordinary code should lead toward predictable behavior.
- Tooling is part of the language: one toolchain, one obvious workflow.
- Frameworks are optional architecture, not mandatory infrastructure.

The project is also interested in the boundary between typed application code and the outside world: HTTP, JSON, configuration, databases and routes. Whether that becomes language syntax, standard library design, first-party packages or compiler tooling is explicitly undecided.

## What the accepted syntax looks like

The following example uses only constructs that `docs/decisions.md` accepts: indentation blocks, `let`, `const`, `fn`, annotations after names, interpolation and word-based operators.

```yanawa
const MAX_RETRIES = 3

fn describe(name: str, attempts: int) -> str:
    if attempts >= MAX_RETRIES and name != "":
        return "{name} has no attempts left"
    return "{name} has {MAX_RETRIES - attempts} attempts left"

fn main():
    let attempts = 1
    print(describe("Morgan", attempts))
```

:::note
This is design syntax, not a program you can run. No tool accepts it yet, and the repository contains no formal grammar. The accepted decisions do not cover every construct here, such as `print`, so treat the example as an illustration of the direction.
:::

The [language design](/projects/yanawa/design/) page lists each accepted decision, the proposals that are still exploratory, and the open questions.

## What is deliberately open

The decisions document lists these as unresolved: explicit versus implicit returns, the primitive type set, visibility defaults, `self` inside methods, the object model, traits, inheritance, `switch` and pattern matching, error handling, generics, the module and package systems, concurrency, memory management, the compiler implementation language, the runtime model, compilation targets and the standard library boundaries.

Implementation choices such as the compiler's language, the memory strategy and the production backend are intentionally not made. The first implementation is expected to favor language experimentation and correctness over optimization.

## References

- [yanawa repository](https://github.com/yanawa/yanawa) and its [design documents](https://github.com/yanawa/yanawa/tree/7fd082e/docs).
- [Design decisions D001 to D016](https://github.com/yanawa/yanawa/blob/7fd082e/docs/decisions.md).
- [Started designing a language before I could compile one](https://dump.raioviajante.com/posts/started-designing-a-language-before-i-could-compile-one), an essay on Dump.
