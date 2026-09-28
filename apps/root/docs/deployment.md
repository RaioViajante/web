# Deployment

## Target

```text
raioviajante.com -> Vercel
```

The production domain is raioviajante.com; `www.raioviajante.com` redirects to
it. The app deploys from the `RaioViajante/web` monorepo with `apps/root` as
the Vercel project's Root Directory. The shared production topology, build
settings, and Ignored Build Step are documented in the repository-level
[deployment guide](../../../docs/deployment.md).

Vercel detects the Next.js App Router project automatically. No `vercel.json`
or other Vercel-specific configuration is required; keep it that way unless a
real need appears.

## Related deployments

dump.raioviajante.com, lab.raioviajante.com, and docs.raioviajante.com are
separate apps in the same monorepo, each deployed by its own Vercel project.
Never implement them as local routes here; see [architecture](architecture.md).

## Future redirect

bryanalvarenga.com.br is intended to redirect permanently to raioviajante.com
once its DNS is configured. That DNS and redirect have not been set up yet;
do not configure them until explicitly requested.
