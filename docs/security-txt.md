# security.txt

Each production host serves a static [RFC 9116](https://www.rfc-editor.org/rfc/rfc9116)
file at `/.well-known/security.txt`:

- `https://raioviajante.com/.well-known/security.txt`
- `https://dump.raioviajante.com/.well-known/security.txt`
- `https://docs.raioviajante.com/.well-known/security.txt`
- `https://lab.raioviajante.com/.well-known/security.txt`

Fields: `Contact` (`mailto:mail@raioviajante.com`), `Expires`,
`Preferred-Languages: en, pt` and a per-host `Canonical`. No `Encryption`,
`Acknowledgments`, `Policy` or `Hiring` field is published because no such
destination exists. This file is a contact channel only; it states no policy,
response time or guarantee.

## Source and generation

`security/security-txt.ts` is the only source: shared field values, the renderer
and the validator. `node security/sync-vercel.mjs` writes
`apps/<app>/public/.well-known/security.txt` for all four apps. Those files are
generated and committed; do not edit them by hand. Next.js and Astro both copy
`public/` verbatim, so the file is static in every app and needs no route,
rendering change or runtime code.

## Expiry

RFC 9116 requires exactly one `Expires` and recommends less than a year ahead.
The value is a fixed timestamp (currently `2027-10-01T00:00:00Z`), never
generated per request.

`pnpm security:check` (part of `pnpm validate`) enforces both the RFC and
stricter repository rules. Tests are in `security/security-txt.test.mjs`.

RFC 9116 (checked against the published text): `Contact` and `Expires` are
required; `Contact` and `Canonical` may repeat; `Expires` and
`Preferred-Languages` must not; `Expires` should be less than a year ahead; the
file must be under `/.well-known/`, served over HTTPS as `text/plain` with
`charset=utf-8`; lines end in LF or CRLF.

Repository rules, not RFC requirements: every host publishes the same single
`Contact` and `Preferred-Languages` and its own `Canonical` (optional in the
RFC); LF endings only; `Expires` in UTC `Z` form; at least 30 days remaining;
at most 366 days ahead (an approximation of the RFC's "less than a year"); and
the committed files must equal the generated output. Adding a second `Contact`
is RFC-valid but needs a source and validator change here.

## Renewal

1. Move `expires` in `security/security-txt.ts` forward, under one year.
2. Run `node security/sync-vercel.mjs`, then `pnpm security:check`.
3. Commit the source and the four generated files, and deploy.

The guard only runs when validation runs, so renew when it first fails rather
than waiting for the deadline.

The RFC requires `Content-Type: text/plain; charset=utf-8`. Local previews
return `text/plain; charset=UTF-8` from Next and `text/plain` without a charset
from Astro preview, so the Vercel response is what counts: the live check is
part of [operations.md](operations.md). Add explicit header configuration only if
a host ever serves it without the charset.
