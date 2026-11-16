import type { ReactNode } from "react";

/** A title types in at most this many steps, about a second in all. */
export const TYPED_STEPS = 20;

/**
 * The steps a title types in: one character each up to TYPED_STEPS
 * characters; a longer title types a few characters per step. The last
 * character is always a step of its own, since the caret is its shadow.
 */
export function typedSteps(text: string): string[] {
  const chars = [...text];
  if (chars.length <= TYPED_STEPS) return chars;
  const last = chars.pop()!;
  const size = Math.ceil(chars.length / (TYPED_STEPS - 1));
  const steps: string[] = [];
  for (let index = 0; index < chars.length; index += size)
    steps.push(chars.slice(index, index + size).join(""));
  return [...steps, last];
}

/**
 * A page title that types itself once when the page appears: its characters
 * fade in, in reading order (so a title that wraps types line after line),
 * then a block caret blinks and goes. Static markup and CSS only
 * (`styles/typed.css`): no script, no inline style (each step's place is a
 * class), nothing hidden in print or under reduced motion. The text is the
 * plain title for search and copying, and the heading is named by it.
 */
export function TypedTitle({
  text,
  className,
  children,
}: {
  text: string;
  className?: string;
  /** Rendered after the title, untyped. */
  children?: ReactNode;
}) {
  return (
    <h1
      className={className ? `rv-typed ${className}` : "rv-typed"}
      // The name every engine computes from per-character spans is not the
      // same (some put a space between each); this keeps it the title.
      aria-label={text}
    >
      {typedSteps(text).map((step, index) => (
        <span key={index} className={`rv-c${index}`}>
          {step}
        </span>
      ))}
      {children}
    </h1>
  );
}
