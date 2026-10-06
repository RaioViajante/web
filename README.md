<p align="center">
  <img src="packages/design/assets/stickers/sitting.png" alt="RaioViajante sitting" width="220">
</p>

<h1 align="center">raioviajante</h1>

<p align="center">curious enough to build it myself.</p>

---

The home of RaioViajante on the web: four small sites, one design system.

| site | what it is |
|---|---|
| [raioviajante.com](https://raioviajante.com) | the index — who, what, where |
| [dump](https://dump.raioviajante.com) | writing — notes from building things |
| [docs](https://docs.raioviajante.com) | documentation for the projects |
| [lab](https://lab.raioviajante.com) | experiments you can poke at — things may break |

## Structure

    apps/              one folder per site
    packages/design/   everything shared: tokens, components, sound, search, artwork
    docs/              design system, blocks, deployment

Anything used by more than one site lives in `packages/design`, and only there.

## Running it

    pnpm install
    pnpm --filter ./apps/<site> dev
    pnpm validate      # format, lint, typecheck, tests and builds

## Read next

- [`docs/design-system.md`](docs/design-system.md) — how everything looks and sounds
- [`docs/blocks.md`](docs/blocks.md) — code and content blocks
- [`docs/deployment.md`](docs/deployment.md) — how the sites ship
- [`AGENTS.md`](AGENTS.md) — rules for anyone (or anything) changing the code

## License

| part | license |
|---|---|
| code | [MIT](LICENSE) |
| docs content | [CC BY 4.0](apps/docs/src/content/docs/LICENSE) |
| dump posts | [all rights reserved](apps/dump/content/posts/LICENSE) |
| artwork, character and name | [all rights reserved](packages/design/assets/LICENSE) |

## Contact

mail@raioviajante.com
