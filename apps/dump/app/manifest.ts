import type { MetadataRoute } from "next";
import { webManifest } from "../../../seo/metadata";
import { themeColor } from "@raioviajante/design/theme-color";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  return webManifest("dump", {
    themeColor: await themeColor(),
  });
}
