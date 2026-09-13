---
title: Design language
description: Shared tokens, typography, and restraint across the RaioViajante ecosystem.
---

Root, dump, docs and lab share one visual DNA while serving different roles — a minimal personal index, editorial writing, technical publication, and experimental space. The identity does not change between them; only the register does.

## Shared tokens

Every surface draws from the same three colors — background `#18161b`, foreground `#ece7e0`, and a restrained accent `#c3b3e0`. IBM Plex Mono carries UI, paths and metadata; Source Serif 4 carries prose.

```css
:root {
  --background: #18161b;
  --foreground: #ece7e0;
  --accent: #c3b3e0;
}
```

## Typographic principle

> Mono identifies. Serif speaks.

Anything that names, locates or labels — identity, navigation, paths, code — sets in mono. Anything that explains, argues or describes sets in serif. The split is never decorative; it tells the reader which register they are reading in.

## Restraint

Whitespace does the organizing, not boxes. The accent is a spot color, used sparingly for active state and identity marks, never as a background wash. Nothing here should read as generic SaaS documentation or as AI-generated decoration — no gradients, no glow, no bento grids.
