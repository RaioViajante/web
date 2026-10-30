import { Fragment } from "react";
import type { RichText } from "../lib/bench-copy";

/** Renders catalog text with inline `code` spans. */
export function Rich({ text }: { text: RichText }) {
  return (
    <>
      {text.map((part, index) =>
        typeof part === "string" ? (
          <Fragment key={index}>{part}</Fragment>
        ) : (
          <code key={index}>{part.code}</code>
        ),
      )}
    </>
  );
}
