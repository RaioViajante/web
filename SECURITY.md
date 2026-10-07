# Security policy

## Reporting a vulnerability

Report security vulnerabilities privately by email to
**mail@raioviajante.com**. Please do not open a public issue, pull request or
discussion for a vulnerability that has not been fixed.

Include enough to investigate:

- which site or part of the repository is affected (root, dump, docs, lab, or a
  shared package or tool);
- what you observed, and what you expected;
- the steps, URL or request that reproduce it;
- your assessment of the impact, if you have one.

This is a personal project maintained by one person. There is no response-time
commitment, no bug bounty and no encrypted channel: please do not send secrets
or exploit details you would not want in plain email.

## Scope

This repository is the source of the four sites at `raioviajante.com`,
`dump.raioviajante.com`, `docs.raioviajante.com` and `lab.raioviajante.com`.
There are no release branches: the current `main` is the only supported
version.

Each site's `/.well-known/security.txt` carries the same contact. It is
generated from `security/security-txt.ts`; see
[docs/security-txt.md](docs/security-txt.md).

## Other security documentation

- [Security headers and CSP](docs/security-headers.md)
- [Automated security maintenance](docs/security-maintenance.md)
