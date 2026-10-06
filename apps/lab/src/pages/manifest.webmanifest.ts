import { webManifest } from "@raioviajante/design/seo";

export function GET() {
  return new Response(JSON.stringify(webManifest("lab")), {
    headers: { "Content-Type": "application/manifest+json" },
  });
}
