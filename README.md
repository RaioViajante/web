<img align="right" src="packages/design/assets/stickers/sitting.png" alt="RaioViajante" width="190">

my corner of the internet.<br>
four small sites, one design system.

<pre>
00. <a href="https://raioviajante.com">index</a> ···················· who, what, where
01. <a href="https://dump.raioviajante.com">dump</a> ····················· writing
02. <a href="https://docs.raioviajante.com">docs</a> ····················· documentation
03. <a href="https://lab.raioviajante.com">lab</a> ······················ experiments, things may break
</pre>

<br clear="right">

#### what's inside

```
apps/              one folder per site
packages/design/   shared visual language and behavior
site/ seo/ security/   neutral config, SEO helpers, HTTP policy
docs/              the long version of everything
```

#### run it

```
pnpm install
pnpm --filter ./apps/<site> dev
pnpm validate
```

#### read next

<pre>
<a href="docs/design-system.md">design-system.md</a> ············· how it looks and sounds
<a href="docs/blocks.md">blocks.md</a> ···················· code and content blocks
<a href="docs/deployment.md">deployment.md</a> ················ how it ships
<a href="CONTRIBUTING.md">CONTRIBUTING.md</a> ·············· setup, checks, commits
<a href="SECURITY.md">SECURITY.md</a> ·················· reporting a vulnerability
<a href="AGENTS.md">AGENTS.md</a> ···················· rules for whoever touches the code
</pre>

#### license

<pre>
code ························· <a href="LICENSE">MIT</a>
docs ························· <a href="apps/docs/src/content/docs/LICENSE">CC BY 4.0</a>
posts ························ <a href="apps/dump/content/posts/LICENSE">all rights reserved</a>
artwork + character ·········· <a href="packages/design/assets/LICENSE">all rights reserved</a>
</pre>

<p align="center"><sub>best viewed with the sound on · <a href="mailto:mail@raioviajante.com">mail@raioviajante.com</a></sub></p>
