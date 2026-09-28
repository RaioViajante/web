# Deployment

`lab.raioviajante.com` is deployed by its own Vercel project, `lab`, from the
`RaioViajante/web` monorepo with `apps/lab` as the Root Directory. Astro's
static output (`dist/`) is what gets served.

The shared production topology, build settings, and rollout requirements are
documented in the repository-level
[deployment guide](../../../docs/deployment.md).
