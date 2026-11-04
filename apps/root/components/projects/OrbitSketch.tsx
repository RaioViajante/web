"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { ProjectArtCopy } from "../../lib/projects";
import {
  isFinished,
  transition,
  type ExecutionAction,
  type ExecutionState,
} from "../../lib/sketch-demos";

interface Execution {
  id: string;
  state: ExecutionState;
  /** Faded out after finishing, then dropped. */
  gone: boolean;
  speed: number;
  delay: number;
}

interface LogLine {
  key: number;
  time: string;
  id: string;
  from?: ExecutionState;
  to: ExecutionState;
}

interface Snapshot {
  executions: Execution[];
  log: LogLine[];
}

const MAX_LIVE = 6;

/**
 * The simulation, outside React: timers stand in for the scheduler and the
 * workers Orbit does not have yet, and every change goes through Orbit's
 * transition rules (`transition`). `emit` receives each new snapshot.
 */
function createSimulation(
  emit: (snapshot: Snapshot) => void,
  stamp: () => string,
) {
  let executions: Execution[] = [];
  let log: LogLine[] = [];
  let sequence = 140;
  let lines = 0;
  const timers = new Set<ReturnType<typeof setTimeout>>();

  const publish = () => emit({ executions, log });
  const later = (callback: () => void, ms: number) => {
    const timer = setTimeout(() => {
      timers.delete(timer);
      callback();
    }, ms);
    timers.add(timer);
  };
  const record = (id: string, to: ExecutionState, from?: ExecutionState) => {
    log = [...log, { key: lines++, time: stamp(), id, from, to }].slice(-5);
  };
  const patch = (id: string, change: Partial<Execution>) => {
    executions = executions.map((item) =>
      item.id === id ? { ...item, ...change } : item,
    );
  };

  function apply(id: string, action: ExecutionAction) {
    const execution = executions.find((item) => item.id === id);
    if (!execution || execution.gone) return undefined;
    const next = transition(execution.state, action);
    if (!next) return undefined;
    patch(id, { state: next });
    record(id, next, execution.state);
    publish();
    if (isFinished(next))
      later(() => {
        patch(id, { gone: true });
        publish();
      }, 3200);
    else if (next === "running")
      later(
        () => apply(id, Math.random() < 0.72 ? "succeed" : "fail"),
        2600 + Math.random() * 1800,
      );
    return { from: execution.state, to: next };
  }

  return {
    queue() {
      executions = executions.filter((item) => !item.gone);
      if (executions.length >= MAX_LIVE) return undefined;
      const id = `exec-${String(++sequence).padStart(4, "0")}`;
      executions = [
        ...executions,
        {
          id,
          state: "queued",
          gone: false,
          speed: 13 + Math.random() * 7,
          delay: -Math.random() * 18,
        },
      ];
      record(id, "queued");
      publish();
      later(() => apply(id, "start"), 1500 + Math.random() * 900);
      return id;
    },
    /** Cancels the running execution, or else the oldest queued one. */
    cancel() {
      const live = executions.filter(
        (item) => !item.gone && !isFinished(item.state),
      );
      const target = live.find((item) => item.state === "running") ?? live[0];
      if (!target) return undefined;
      const change = apply(target.id, "cancel");
      return change && { id: target.id, ...change };
    },
    dispose() {
      timers.forEach(clearTimeout);
      timers.clear();
    },
  };
}

/**
 * Executions moving through Orbit's states, simulated in the browser with the
 * transitions Orbit's domain allows. Nothing is scheduled or run.
 */
export function OrbitSketch({
  label,
  simulated,
  text,
  intlLocale,
}: {
  label: string;
  simulated: string;
  text: ProjectArtCopy["orbit"];
  intlLocale: string;
}) {
  const [{ executions, log }, setSnapshot] = useState<Snapshot>({
    executions: [],
    log: [],
  });
  const [announcement, setAnnouncement] = useState("");
  const simulation = useRef<ReturnType<typeof createSimulation>>(undefined);
  const root = useRef<HTMLDivElement>(null);

  // One execution starts on its own the first time the sketch comes into
  // view, and runs its course in a few seconds; after that, only the visitor
  // starts them (WCAG 2.2.2).
  useEffect(() => {
    const clock = new Intl.DateTimeFormat(intlLocale, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    const current = createSimulation(setSnapshot, () =>
      clock.format(new Date()),
    );
    simulation.current = current;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      observer.disconnect();
      current.queue();
    });
    if (root.current) observer.observe(root.current);
    return () => {
      observer.disconnect();
      current.dispose();
    };
  }, [intlLocale]);

  const queue = () => {
    const id = simulation.current?.queue();
    setAnnouncement(id ? `${id}: ${text.queued}` : text.full);
  };
  const counts: Record<ExecutionState, number> = {
    queued: 0,
    running: 0,
    succeeded: 0,
    failed: 0,
    cancelled: 0,
  };
  for (const item of executions) if (!item.gone) counts[item.state]++;
  const cancellable = executions.some(
    (item) => !item.gone && !isFinished(item.state),
  );

  // `aria-disabled` rather than `disabled`, so focus stays on the button when
  // the last execution finishes under it.
  const cancel = () => {
    if (!cancellable) return;
    const change = simulation.current?.cancel();
    if (change)
      setAnnouncement(
        `${change.id}: ${text[change.from]} → ${text[change.to]}`,
      );
  };

  return (
    <div className="sk sk--orbit" ref={root} role="group" aria-label={label}>
      <div className="ob-system" aria-hidden="true">
        <span className="ob-ring is-outer" />
        <span className="ob-ring is-middle" />
        <span className="ob-ring is-inner" />
        <span className="ob-core" />
        <span className="ob-ring-label is-outer">{text.queued}</span>
        <span className="ob-ring-label is-middle">{text.running}</span>
        <span className="ob-ring-label is-inner">{text.finished}</span>
        {executions.map((item) => (
          <span
            key={item.id}
            className="ob-execution"
            data-state={item.state}
            data-gone={item.gone || undefined}
            style={
              {
                "--speed": `${item.speed.toFixed(1)}s`,
                "--delay": `${item.delay.toFixed(1)}s`,
                "--angle": `${Math.round((-item.delay / item.speed) * 360)}deg`,
              } as CSSProperties
            }
          >
            <span />
          </span>
        ))}
      </div>
      <div className="ob-side">
        <div className="ob-head">
          <span className="ob-head__name">{text.header}</span>
          <span>{simulated}</span>
        </div>
        <ol className="ob-log" aria-label={text.log}>
          {log.length ? (
            log.map((line) => (
              <li key={line.key} data-state={line.to}>
                <span className="ob-log__time">{line.time}</span>
                <span className="ob-log__id">{line.id}</span>
                <span className="ob-log__change">
                  {line.from ? `${text[line.from]} → ` : ""}
                  {text[line.to]}
                </span>
              </li>
            ))
          ) : (
            <li className="ob-log__idle">{text.idle}</li>
          )}
        </ol>
        <div className="ob-controls">
          <button
            type="button"
            className="ob-button"
            data-sound="click"
            onClick={queue}
          >
            {text.queue}
          </button>
          <button
            type="button"
            className="ob-button is-quiet"
            data-sound={cancellable ? "click" : undefined}
            onClick={cancel}
            aria-disabled={!cancellable}
          >
            {text.cancel}
          </button>
        </div>
        <p className="ob-counts">
          <span className="rv-sr-only">{text.counts}: </span>
          {(Object.keys(counts) as ExecutionState[]).map((state) => (
            <span key={state}>
              <b>{counts[state]}</b> {text[state]}
            </span>
          ))}
        </p>
        <p className="rv-sr-only" aria-live="polite">
          {announcement}
        </p>
      </div>
    </div>
  );
}
