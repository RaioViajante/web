import type { ReactNode } from "react";

export function LeaderRow({
  name,
  note,
}: {
  name: ReactNode;
  note: ReactNode;
}) {
  return (
    <div className="rv-leader">
      <span className="rv-leader-name">{name}</span>
      <span className="rv-leader-dots" aria-hidden="true" />
      <span className="rv-leader-note">{note}</span>
    </div>
  );
}
