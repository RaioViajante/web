---
title: Repository conventions
description: Commits, branches, and how work lands across RaioViajante repositories.
---

Conventions that apply across RaioViajante's repositories, this site included.

## Commits

Every meaningful unit of work results in its own commit, written in English using [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, `chore:`, ...). One coherent change per commit — unrelated work is never mixed into the same commit, and commit messages are never vague. The diff is reviewed before it's committed.

## Publishing changes

Nothing is pushed to a remote without explicit permission. History is not rewritten: no `--amend` on existing work, no rebasing of shared commits, and no force pushes.

## Language

Filenames, documentation, code, comments, commit messages, and configuration are written in English throughout.
