# Architecture

## The RaioViajante ecosystem

RaioViajante's internet presence is split across separate subdomains, each with a distinct role:

- **`raioviajante.com`** — root / personal internet home
- **`dump.raioviajante.com`** — writing
- **`docs.raioviajante.com`** — public technical documentation (this repository)
- **`lab.raioviajante.com`** — experiments

Each subdomain is expected to be its own repository and its own deployment. This repository covers only `docs.raioviajante.com`.

## Role of this site

`docs.raioviajante.com` is the public technical documentation layer of the RaioViajante identity. It exists to make genuinely useful technical documentation about RaioViajante projects and systems navigable and searchable for the public. It is not a portfolio, blog, marketing site, or a wholesale mirror of internal project documentation.

## Repository documentation vs. public documentation

This repository maintains a strict separation between two kinds of documentation:

- **Repository documentation** — lives in `docs/` (this directory). It documents how to develop, maintain, and reason about this repository itself: architecture, content philosophy, design system, development workflow, deployment. It is read by contributors and agents, not published to the site.
- **Public documentation** — will live in `src/content/docs/`, rendered by Starlight as the actual pages of docs.raioviajante.com. This directory does not exist yet; it will be created when the Astro/Starlight application is initialized.

Do not place public-facing content in `docs/`, and do not place repository-maintenance notes in `src/content/docs/`.

## Status

The Astro/Starlight application has not been initialized yet. This document describes the intended structure and separation of concerns, not implementation details of a build that doesn't exist yet. Once Starlight is initialized, this document should be updated to reflect the actual project structure (routing, content collections, integrations) rather than only the conceptual model above.
