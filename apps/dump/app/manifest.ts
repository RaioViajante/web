import type { MetadataRoute } from "next";
import { webManifest } from "@raioviajante/design/seo";

export default function manifest(): MetadataRoute.Manifest {
  return webManifest("dump");
}
