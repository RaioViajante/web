---
contentId: projects/ordelis
locale: en
originalLocale: en
path: /projects/ordelis/
title: Ordelis
description: A local-first, open-source desktop workspace being built to coordinate AI coding agents. What is implemented, what is inherited, and what is still a plan.
tagline: Your agents, in order. Early development.
order: 1.4
group: projects
status: early development
meta:
  - macos first
  - tauri · python
source: https://github.com/RaioViajante/ordelis
summary: desktop workspace for coordinating AI coding agents
---

## Overview

Ordelis is meant to keep work with coding agents in order: describe a task, plan the work, coordinate the agents, review the evidence, and decide for yourself what gets integrated. It is designed to run on your machine. It is not a model, a chatbot or an editor; the agents you already use do the coding.

The project was previously named Synapse, and it began from the open-source MCO command-line runtime, version 0.12.1, by the mco maintainers. The repository still contains that inherited runtime under its original names, and some internal identifiers keep the Synapse name while the rename is finished. The MIT license carries the original copyright notice.

:::important
The complete workflow is not implemented. The desktop application shows sample data and cannot run agents. The command-line runtime can run agents, but it is not connected to the desktop. There are no releases, installers or downloads.
:::

## Current state

Verified against the source repository at commit `a9cf7d5`. The repository is public.

| Capability | State | Where |
| --- | --- | --- |
| Desktop shell with six pages | prototype | React and TypeScript in a Tauri 2 webview; mostly sample data |
| Closed list of native commands | implemented | six reviewed commands behind an explicit access manifest |
| Local project registry | implemented in the backend, macOS only | no page calls it yet |
| Running agents from a terminal | implemented, inherited | `mco run`, `mco review`, `mco session` in the Python runtime |
| Provider adapters | implemented, inherited | Claude Code, Codex, OpenCode and others; not connected to the desktop |
| Kimi adapter | not present | a decision on how to integrate it is pending |
| Context preview and a non-dispatching plan | implemented on the command line | `mco context preview` and `mco context plan` |
| Execution Safety Gate | implemented as a library | always answers no; not connected to the application |
| Running agents from the desktop | planned | no code path exists |
| Reviewable multi-stage plans and approvals | planned | the desktop task preview changes nothing |
| One Git worktree per agent | planned | no worktree code exists in the runtime |
| Sandbox or enforced confinement | not present | stated plainly in the security documents |
| Windows and Linux | not verified | the desktop has only been built and run on macOS |

## Architecture

There are three layers, and the first two are the only ones the desktop connects.

```text
Interface (React, TypeScript, in a webview)
  | a closed list of six typed native commands
Native layer (Rust, Tauri 2)
  | development builds only, one fixed question
Python runtime (inherited MCO plus additions)
  | only when you run the command line yourself
Agent CLIs installed on your machine
```

The interface never reaches the operating system directly. It calls a short list of typed commands that the native layer declares and tests. The native layer owns validation, path checks and, in the intended design, the lifetime of processes. The runtime coordinates agents. In development builds only, the desktop can ask the runtime one fixed question, which is to identify itself. A release build contains no way to start Python.

Orchestration and agent implementation are kept separate on purpose: Ordelis decides what runs and under which limits, and each agent stays responsible for how it works. The [security page](/projects/ordelis/security/) covers the boundaries in detail.

## Agent integrations

Providers do not expose the same capabilities, and Ordelis does not assume they do. The inherited runtime has one adapter module per provider under `runtime/adapters`, among them Claude Code, Codex, OpenCode, Gemini, Qwen, Copilot, Cursor, Grok, Hermes, Ollama, Pi and `agy`, plus a way to configure a custom command-line agent. `mco doctor` checks installation and authentication readiness, and `mco agent` lists, checks and inspects models.

Kimi is part of the product vision, but no Kimi adapter exists in the runtime. The project records two possible routes, through OpenCode or through its own command line, and requires a local comparison of the read-only boundary, model selection, cancellation and usage reporting before choosing.

## Execution

What runs today is the inherited runtime. `mco run` sends one prompt to several agents in parallel or in a chain, with a deadline per invocation, a stall timeout, a deadline for the whole run, cancellation, and per-invocation status and artifacts. Three execution modes are translated to each provider's own controls, where the provider has them (Hermes, for one, has none for `read_only` or `write`):

| Mode | Intent |
| --- | --- |
| `read_only` | the agent may read but should not change files |
| `write` | the agent may edit files |
| `yolo` | the agent skips its permission checks |

These are the provider's controls, not Ordelis confinement. The runtime has no approval gates, and `--allow-paths` validates the requested scope without creating an operating-system sandbox. The session daemon applies a `RetryPolicy` with exponential backoff, which defaults to two retries.

The intended execution design is different and is not built: a stage would start only from an approved plan, under a per-stage policy covering what the agent may read, what it may write, whether it may use the network and how long it may run, with human authorization gates that no timeout can approve. That design is a proposal.

## Review

`mco review` runs a read-only review across chosen agents and returns every raw answer with its status; `--debate` and `--synthesize` add read-only stages. The runtime deliberately does not turn answers into findings or consensus. Independent reviewer roles, severities, evidence reports and an audit trail of decisions are planned.

## Testing

The Python runtime has 59 test modules, run with `python3 -m unittest`. The desktop has lint, type-check and unit tests with pnpm, plus Rust tests that exercise the real access-control manifest with Tauri's mock runtime. The desktop build is verified on macOS in continuous integration. These suites were read for this page and not run. The Rust tests do not drive a live webview.

## Limitations

- The desktop cannot start, stop or observe an agent.
- The command line is not governed by the planned safety model, and it stores sessions inside the repository by default.
- No process is confined. The safety documents say that checks are not enforcement.
- Hostile code running as the same user is out of scope for the current design.
- Only macOS has been built and run.

## Roadmap

The roadmap orders work without dates or version numbers. It covers finishing the rename, a redesign of the desktop, real provider discovery, task planning and approvals, safe agent execution behind a separately reviewed coordinator, Git worktree orchestration, independent review and integration, session continuity, and cross-platform verification. A first release is also gated on release-hardening work and a security review, which the project tracks in its issues.

## References

- [Ordelis repository](https://github.com/RaioViajante/ordelis)
- [Features and their current state](https://github.com/RaioViajante/ordelis/blob/a9cf7d5/docs/product/features.md)
- [Roadmap](https://github.com/RaioViajante/ordelis/blob/a9cf7d5/docs/product/roadmap.md)
- [Architecture overview](https://github.com/RaioViajante/ordelis/blob/a9cf7d5/docs/architecture/overview.md)
- [MCO, the inherited runtime](https://github.com/mco-org/mco)
