/**
 * "1 experiment", "3 experiments": the index filter's live result, shared by
 * the static markup and the browser script so neither hard-codes a count.
 */
export function experimentCount(count: number) {
  return `${count} ${count === 1 ? "experiment" : "experiments"}`;
}
