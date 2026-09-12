# Deployment

## Target

```text
raioviajante.com -> Vercel
```

The production domain is raioviajante.com. The application deploys to Vercel
from its GitHub repository (`RaioViajante/raioviajante.com`): pushes to `main`
are expected to produce production deployments, with preview deployments for
other branches and pull requests.

Vercel detects the Next.js App Router project automatically and runs
`pnpm install` and `pnpm build`. No `vercel.json` or other Vercel-specific
configuration is required; keep it that way unless a real need appears.

## Related deployments

dump.raioviajante.com, lab.raioviajante.com, and docs.raioviajante.com are
independently deployed applications outside this repository. Never implement
them as local routes here; see [architecture](architecture.md).

## Future redirect

bryanalvarenga.com.br is intended to redirect permanently to raioviajante.com
once its DNS is configured. That DNS and redirect have not been set up yet;
do not configure them until explicitly requested.
