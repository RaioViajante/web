# Repository history

RaioViajante/web was created by preserving and combining the Git histories of
four repositories:

| Original repository             | Path in this repository | Import tag    |
| ------------------------------- | ----------------------- | ------------- |
| `RaioViajante/raioviajante.com` | `apps/root`             | `import/root` |
| `RaioViajante/dump`             | `apps/dump`             | `import/dump` |
| `RaioViajante/docs`             | `apps/docs`             | `import/docs` |
| `RaioViajante/lab`              | `apps/lab`              | `import/lab`  |

Each import tag points at the last imported commit of that history. The four
histories are joined by one initial commit and one merge commit per import.

## What was preserved

Every historical commit was rewritten only to move its files under
`apps/<app>/`. For every imported commit:

- author and committer names, emails, and dates are unchanged;
- the commit message is unchanged;
- ancestry within each app's history is unchanged;
- the file tree is unchanged, apart from its new subdirectory.

Commit SHAs are different from the originals, because the tree paths changed.

## Package management after the import

Before the monorepo, each app had its own lockfile and package manager: dump
used npm, root used pnpm 12.4.1, and docs and lab were built with pnpm 10 on
Vercel. The pnpm workspace replaced them with one root lockfile; all four apps
now build with pnpm 12.4.1. Merging the per-app lockfiles reconciled a few
transitive dependency versions, recorded in the `chore: establish pnpm
workspace` commit.

## Historical references

Issue references such as `#20` in imported dump commit messages refer to the
original `RaioViajante/dump` issue tracker, not to issues in this repository.

## Original repositories

The original repositories remain available. root, docs, and lab are archived;
dump remains active while the new comments flow is verified in production.
The current dump source configuration targets GitHub Discussions on
`RaioViajante/web`.
