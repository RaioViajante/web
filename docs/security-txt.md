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

`pnpm security:check` (part of `pnpm validate`) fails when a generated file has
drifted from the source, is malformed, has duplicate singleton fields, a wrong
`Canonical`, is expired, has fewer than 30 days left, or is more than 366 days
ahead. Tests are in `security/security-txt.test.mjs`.

## Renewal

1. Move `expires` in `security/security-txt.ts` forward, under one year.
2. Run `node security/sync-vercel.mjs`, then `pnpm security:check`.
3. Commit the source and the four generated files, and deploy.

The guard only runs when validation runs, so renew when it first fails rather
than waiting for the deadline. Content type and behavior on the live hosts have
not been verified; check them after deployment.
