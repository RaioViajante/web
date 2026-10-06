import type { MetadataRoute } from "next";
import { webManifest } from "@raioviajante/design/seo";
import { themeColor } from "@raioviajante/design/theme-color";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  return webManifest("dump", {
    themeColor: await themeColor(),
  });
}
