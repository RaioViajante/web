import { robotsResponse } from "../../../../seo/metadata";
import { origin } from "../lib/seo";
export function GET() {
  return robotsResponse(origin);
}
