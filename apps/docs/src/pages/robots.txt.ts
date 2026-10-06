import { robotsResponse } from "@raioviajante/design/seo";
import { origin } from "../lib/seo";
export function GET() {
	return robotsResponse(origin);
}
