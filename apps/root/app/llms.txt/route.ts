import { llmsResponse } from "../../../../seo/llms";

export const dynamic = "force-static";

export function GET() {
  return llmsResponse("root");
}
