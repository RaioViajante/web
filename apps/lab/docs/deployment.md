# Deployment

## Intended model

`lab.raioviajante.com` deploys as its own separate deployment, independent from `raioviajante.com`, `dump`, and `docs`. Each subdomain in the RaioViajante ecosystem is its own repository and its own deployment.

## DNS

The DNS zone for `raioviajante.com` is managed externally, outside this repository. The `lab` subdomain will later be pointed at wherever this application is deployed. No DNS records are documented here yet, since none have been created.

## Status

No deployment target has been chosen or configured yet. Astro's static output (`dist/`) is host-agnostic; this document will be updated with the actual hosting configuration once a deployment target is chosen.
