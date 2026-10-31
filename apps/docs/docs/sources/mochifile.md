# Mochifile: source evidence

Maintenance record for `src/content/docs/projects/mochifile/` and its Portuguese
counterpart. Not published.

- **Sources:** `mochifile/mochifile`, public, commit `4efdc8c` (206 commits).
  `mochifile/cli` and `mochifile/mcp` exist but have no commits. `mochifile/cloud`
  is private; its existence and the statements in the public architecture
  document are the only things the pages say about it. No private code,
  configuration, schema or endpoint is described.
- **Not run:** unit, integration and end-to-end suites were read, not executed.
- **Link rule:** the Portuguese parity test rejects the standalone English words
  `with`, `the`, `and` and others, including inside link targets; the ADR 0016
  file name contains `with`, so the pages link the ADR index instead.

| Claim on the pages | Status | Evidence |
| --- | --- | --- |
| One published tool, `compress-image`, six size variants | implemented | `packages/tools/` holds `compress-image` and `_template`; `manifest.ts` |
| Accepts JPEG, PNG, WebP; 20 files, 50 MB each | implemented | `compress-image/src/config.ts` |
| Convert engine (HEIC, AVIF) has no tool page | partial | `engine-image/src/convert.ts`; no tool package |
| PDF, passport photo, video tools | planned | named as examples in `docs/architecture.md`; no code |
| Processing in a Web Worker; contract split manifest and `process()` | implemented | `tool-kit/src/contract.ts`, ADR 0006 |
| Size search: quality 40 to 90, 97% stop, `target-unreachable` | implemented | ADR 0017, `fit-to-size.ts`, `errors.ts` |
| 100 MP rejection, 16 MP processing cap, 25 MP WebAssembly path, reduced-size JPEG decode above 24 MP | implemented | `engine-image/src/decode.ts` (`WASM_MAX_PIXELS`, `IMAGE_DECODER_MIN_PIXELS`); ADR 0016 still says 24 MP and predates the change |
| Metadata not carried over | implemented | ADR 0016, `strip-metadata.ts` |
| No request follows file selection | project rule | ADR 0022; not machine-verified here |
| Site sends `X-Robots-Tag: noindex` | observed | `curl -sI https://mochifile.com/` on 2026-10-30 |
| Accounts and API not available | verified | sign-in and docs pages say so; `API_BASE_URL` comment; cloud README states nothing is mounted |
| Browsers: Chromium, Firefox, WebKit end to end; no supported-version list | read | `playwright.config.ts`, `docs/contributing/testing.md` |
| axe in 16 e2e specs | counted | `grep -l AxeBuilder apps/web/e2e` |

## Re-verifying

Re-list `packages/tools`; each new tool needs a row and its own claims. Re-check
`mochifile/cli` and `mochifile/mcp` for commits before mentioning them.
