import { webManifest } from "@raioviajante/design/seo";
import { themeColor } from "@raioviajante/design/theme-color";

export async function GET() {
  return new Response(
    JSON.stringify(webManifest("lab", { themeColor: await themeColor() })),
    {
      headers: { "Content-Type": "application/manifest+json" },
    },
  );
}
