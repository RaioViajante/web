import type { ButtonHTMLAttributes, ReactNode } from "react";

/**
 * Lab bench frame. The caption above states where it runs
 * (`runs here`, `simulated`, `source only`).
 */
export function LabBench({
  caption,
  where,
  children,
}: {
  caption: ReactNode;
  where?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="rv-bench">
      <div className="rv-bench__caption">
        <span>{caption}</span>
        {where ? <span>{where}</span> : null}
      </div>
      <div className="rv-bench__frame">{children}</div>
    </div>
  );
}

/** One band of a bench: controls, output, state or history. */
export function BenchBand({
  label,
  children,
}: {
  label?: string;
  children: ReactNode;
}) {
  return (
    <div className="rv-bench__band">
      {label ? <div className="rv-label">{label}</div> : null}
      {children}
    </div>
  );
}

/** A state in a state list. Only the current one is filled. */
export function StateMark({
  current = false,
  children,
}: {
  current?: boolean;
  children: ReactNode;
}) {
  return (
    <span
      className={current ? "rv-state rv-state--current" : "rv-state"}
      aria-current={current ? "true" : undefined}
    >
      {children}
    </span>
  );
}

/**
 * A bench control. Accepted actions are solid, rejected actions are dotted but
 * stay clickable (the click is logged, never blocked), and at most one control
 * is primary. The page plays `success` or `reject` with `playSound`.
 */
export function ActionButton({
  state = "accepted",
  primary = false,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  state?: "accepted" | "rejected";
  primary?: boolean;
}) {
  const classes = ["rv-btn"];
  if (state === "rejected") classes.push("rv-btn--rejected");
  if (primary) classes.push("rv-btn--primary");
  if (className) classes.push(className);
  return (
    <button
      type="button"
      {...props}
      className={classes.join(" ")}
      aria-disabled={state === "rejected" ? "true" : undefined}
    />
  );
}

export function ToggleButton({
  pressed,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { pressed: boolean }) {
  return (
    <button
      type="button"
      data-sound="click"
      {...props}
      className={className ? `rv-toggle ${className}` : "rv-toggle"}
      aria-pressed={pressed}
    />
  );
}
