import type { ExecutionCopy } from "./bench-copy.ts";
import {
  isAllowed,
  operations,
  type ExecutionStatus,
} from "./execution-states.ts";
import { fill } from "./template.ts";

/**
 * "Accepted now: start, cancel. Rejected now: succeed, fail.", in the bench's
 * language. The static markup and the browser script render this one result.
 */
export function availabilityText(
  text: Pick<ExecutionCopy, "availability" | "none" | "operations">,
  status: ExecutionStatus,
): string {
  const labels = (accepted: boolean) =>
    operations
      .filter((operation) => isAllowed(status, operation) === accepted)
      .map((operation) => text.operations[operation])
      .join(", ") || text.none;
  return fill(text.availability, {
    accepted: labels(true),
    rejected: labels(false),
  });
}
