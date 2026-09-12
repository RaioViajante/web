# Agent instructions

## Purpose and scope

raioviajante.com is the root of the RaioViajante internet identity. Build a personal
internet home, not a portfolio, résumé, developer sales page, or SaaS landing page.

Internal routes belong to this application: `/`, `/projects`, and `/now`.

External websites are independently deployed applications:

- https://dump.raioviajante.com
- https://lab.raioviajante.com
- https://docs.raioviajante.com

Never implement these subdomains as local routes.

## Language and implementation

- Use English for filenames, documentation, comments when needed, commit messages,
  metadata, and configuration descriptions.
- Inspect existing code, documentation, and relevant reference files before editing.
- Use Next.js, React, TypeScript, pnpm, ESLint, Prettier, and Vercel.
- Keep the implementation small and maintainable. Prefer native CSS and simple
  solutions; extract components only where reuse exists.
- Do not add unnecessary dependencies, abstractions, or a design system. Do not
  automatically introduce Tailwind, MDX, Shiki, UI libraries, or testing frameworks.
- Keep documentation in `docs/`. Application structure is not initialized yet;
  keep future application code outside the visual reference directory.
- Share the global container, header, and footer across pages. Separate changing
  content from presentation when that makes updates easier.

## Approved design

The brief identifies `/refence/claude-export/` as the visual source of truth.
The actual directory in this checkout is `reference/claude-export/`. Treat the
export as read-only: never modify, move, rename, delete, or build inside it.

Implement the approved interfaces without redesigning them. Preserve hierarchy,
container width, margins, responsive padding, typography, line heights, colors,
spacing, separators, header, footer, GitHub icon treatment, and hover states.
Whitespace is intentional. All internal pages must feel like the same website.

Preserve the restrained editorial / Unix-inspired aesthetic described in
[docs/design.md](docs/design.md). Do not add glassmorphism, bento grids, glowing
gradients, decorative blobs, background grids, fake terminal chrome, skill bars,
huge animations, generic SaaS UI, generic developer portfolio sections, CTA
sections, language logos, or unnecessary cards.

## Git workflow

- Commit every meaningful change as its own coherent unit of work.
- Use Conventional Commits in English, such as `feat: implement homepage` or
  `fix: align recent activity columns`. Never use vague messages.
- Never mix unrelated work in one commit.
- Before every commit, inspect repository status and the diff, validate the work,
  and review the staged diff to ensure only intended files are included.
- Preserve unrelated existing changes. Do not rewrite history or change remotes.
- Do not push without explicit user permission.
- After committing, report the commit hash, message, and repository status.

## Validation

For documentation, check accuracy, links, consistency, scope, and whitespace.
Do not invent commands or claim checks that were not run.

Once the application is initialized, run the relevant development checks, lint,
type checking, formatting checks, and production build using the configured
scripts. Fix material errors and warnings before committing. For UI changes,
compare against the reference at desktop and mobile widths, check navigation and
hover/focus behavior, and verify consistent containers and no horizontal overflow.
Keep validation proportionate; do not add testing dependencies without a need.
Update development documentation when actual commands become available.
