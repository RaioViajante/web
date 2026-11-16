import type { ReactNode } from "react";

/** Characters with their own delay; any after the last share its delay. */
export const TYPED_MAX = 80;

/** How fast a title types: shorter titles slower, so every title takes about a second. */
export function typedPace(length: number) {
  return length <= 20 ? "short" : length <= 40 ? "medium" : "long";
}

/**
 * A page title that types itself once when the page appears: each character
 * fades in, in reading order (so a title that wraps types line after line),
 * then a block caret blinks and goes. Static markup and CSS only
 * (`styles/typed.css`): no script, no inline style (each character's index
 * is a class), nothing hidden in print or under reduced motion. The text is
 * the plain title for search and copying, and the heading is named by it.
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
  const chars = [...text];
  return (
    <h1
      className={className ? `rv-typed ${className}` : "rv-typed"}
      data-pace={typedPace(chars.length)}
      // The name every engine computes from per-character spans is not the
      // same (some put a space between each); this keeps it the title.
      aria-label={text}
    >
      {chars.map((char, index) => (
        <span key={index} className={`rv-c${Math.min(index, TYPED_MAX - 1)}`}>
          {char}
        </span>
      ))}
      {children}
    </h1>
  );
}
