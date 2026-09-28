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

## Historical references

Issue references such as `#20` in imported dump commit messages refer to the
original `RaioViajante/dump` issue tracker, not to issues in this repository.

## Original repositories

The original repositories remain available and are not archived. dump's
comments are backed by GitHub Discussions on `RaioViajante/dump`.
