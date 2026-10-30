# Ordelis: source evidence

Maintenance record for `src/content/docs/projects/ordelis/` and its Portuguese
counterpart. Not published.

- **Source:** `RaioViajante/ordelis`, public, commit `a9cf7d5` (307 commits since
  the MCO bootstrap, 2026-02-26). Previously named Synapse; the migration record
  `docs/migration/ordelis.md` dates the decision 2026-10-28.
- **Not run:** Python, Rust and desktop tests were read, not executed.
- **Withheld on purpose:** nothing beyond the repository's public documents.
  The pages do not describe the private authorization ledger internals, probe
  artifacts or the history assessment that the roadmap says is tracked privately.

| Claim on the pages | Status | Evidence |
| --- | --- | --- |
| Six native commands, manifest and capability file | implemented | `desktop/src-tauri/build.rs`, `src/lib.rs` |
| Desktop pages Home, Projects, Sessions, Context, Agents, Settings; sample data | prototype | `desktop/src/pages`, `docs/implementation/desktop-architecture.md` |
| Release build cannot start Python | implemented | `runtime_bridge.rs` (`dev-runtime` feature, `compile_error!`) |
| CSP without remote hosts | implemented | `tauri.conf.json` |
| Project registry, macOS only, no caller in the interface | implemented (backend) | `src-tauri/src/projects*`, `docs/implementation/desktop-local-projects.md` |
| Safety gate always answers no | implemented | `runtime/execution_safety_gate.py` return value, reasons |
| Adapters under `runtime/adapters`; no Kimi | verified | directory listing; `grep -ri kimi runtime` is empty |
| `mco run`, `review`, `session`, `agent`, `doctor`, `context` | implemented, inherited | `runtime/cli.py` subparsers |
| Modes `read_only`, `write`, `yolo` map to provider controls | implemented | `runtime/execution_modes.py` |
| `RetryPolicy` defaults: two retries, exponential | implemented | `runtime/retry.py`, `runtime/session/daemon.py` |
| Worktrees, approvals, desktop execution, review roles | planned | no worktree code in `runtime`; `docs/product/roadmap.md` |
| Network approval | planned | `docs/architecture/execution.md` "execution policy"; no code |
| macOS only | stated | `docs/product/features.md` K; not independently re-run |
| 59 Python test modules | counted | `ls tests/test_*.py` |

## Re-verifying

Compare the roadmap phases and the features table with the repository at the new
commit. The rename (Synapse to Ordelis) is in progress; identifiers such as
`synapse-desktop` and the bundle identifier will change, and the pages then
need review. A Kimi adapter or any desktop execution path changes the first
table rows.
