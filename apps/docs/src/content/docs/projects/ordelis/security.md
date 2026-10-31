---
contentId: projects/ordelis/security
locale: en
originalLocale: en
path: /projects/ordelis/security/
title: Ordelis security architecture
description: The trust boundaries, the safety gate and the permission model of Ordelis, separating what is implemented from what is still being designed.
tagline: What is protected today, and what is not claimed.
label: security
order: 1.41
sub: true
group: projects
status: early development
meta:
  - security model
source: https://github.com/RaioViajante/ordelis
summary: trust boundaries, safety gate and what is not yet built
---

## Scope

This page summarizes the security model published in the Ordelis repository, checked against the source at commit `a9cf7d5`. It describes architecture and verified decisions only. To report a vulnerability, use the private reporting route in the repository's security policy, never a public issue.

## Principles

- Local first: no Ordelis account and no cloud backend are required, and the desktop application sends nothing over the network.
- Least privilege: every capability is granted individually and narrowly.
- Observation, planning and execution are different modes, and moving between them takes an explicit step.
- No automatic trust: an earlier success, an agent's claim about itself or the contents of a note never raises permissions.
- Fail closed: missing, stale or unverifiable evidence means no.
- Human approval for destructive operations and for integration into protected branches.
- Credentials stay with their owners: provider authentication stays with each provider's own tool.

## What exists today

| Property | State |
| --- | --- |
| The interface can call exactly six reviewed native commands | implemented and tested |
| A strict content security policy with no remote scripts, fonts or images | implemented and tested |
| The interface has no filesystem, shell, network or plugin permission | implemented and tested |
| A release build cannot start Python | implemented |
| Project registration takes no path from the interface | implemented in the backend, macOS only |
| An Execution Safety Gate that fails closed | implemented as a library |
| Single-use authorization records for controlled probes | implemented as a library, exercised with fake executables |
| A sandbox or enforced confinement | not present |
| Authenticated evidence about a provider process | not present |
| A trusted execution coordinator | not present |
| Execution from the desktop | not present |

## The native boundary

The desktop declares an explicit access manifest naming six commands, and one capability file grants the main window exactly those six permissions. The project's analysis of Tauri 2.12.3 found that the permission list is checked for a local command only when the application declares such a manifest, so the manifest is what makes the list effective.

| Command | Purpose |
| --- | --- |
| `ipc_boundary_status` | proves a call crossed the boundary; reads nothing |
| `get_runtime_status` | development-only identity query to the runtime |
| `list_projects` | list registered projects |
| `add_project` | register a project from a folder the user picks natively |
| `remove_project` | remove a registration by id |
| `reset_projects` | clear the registry |

No command takes a path from the interface. Registering a project is a bookmark: it grants no access to the folder's contents and authorizes nothing. Adding a command means changing the manifest, the handler, the capability file and the tests together, and a Rust test fails if they drift.

The content security policy allows only the application's own resources. Production allows no remote host, no `unsafe-eval` and no inline styles. The runtime bridge is compiled in only with a `dev-runtime` feature, and combining that feature with a release build is a compile error.

## The Execution Safety Gate

The gate is a pure function in `runtime/execution_safety_gate.py`. It answers one question: would the supplied evidence be enough for a future trusted coordinator to consider running this exact command against this exact executable? In the current code the answer to whether it may execute is always no.

It reads dictionaries, returns a dictionary and cannot start a process, apply a confinement profile or contact a provider. Every decision reports that execution, dispatch and evidence authentication are not authorized, with two permanent reasons: the evidence is unauthenticated and there is no trusted execution coordinator. A result that says the requirements are satisfied describes the consistency of caller-supplied claims and nothing more.

:::note
The project states that the coordinator must be designed, implemented and reviewed separately, and must not be built by adding a branch to the gate.
:::

## Approval and network access

Human authorization gates, per-stage permissions and network approval are part of the intended execution design, not of the code. In that design each stage would carry a policy stating what an agent may read and write, whether it may use the network and how long it may run, and a gate would pause a running stage for a fresh human decision when permissions widen. Neither the desktop nor the runtime implements a network-access approval today. The desktop itself has no network permission.

## What is not claimed

- No sandbox or confinement. Neither the gate nor the inherited path option confines a process; they check, they do not enforce.
- No authenticated evidence. A process's statement about its own confinement is never accepted as evidence.
- No equivalent guarantees across operating systems. The protections are macOS-oriented and Windows and Linux are unverified.
- No defense against hostile code running as the same user.
- A confirmation in the interface protects against a misclick, not against a caller.

## References

- [Security architecture](https://github.com/RaioViajante/ordelis/blob/a9cf7d5/docs/architecture/security.md)
- [Execution Safety Gate](https://github.com/RaioViajante/ordelis/blob/a9cf7d5/docs/implementation/execution-safety-gate.md)
- [Desktop architecture](https://github.com/RaioViajante/ordelis/blob/a9cf7d5/docs/implementation/desktop-architecture.md)
- [Security policy](https://github.com/RaioViajante/ordelis/blob/a9cf7d5/SECURITY.md)
