import "../styles/index.css";
import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { startBehavior } from "../behavior";
import {
  ActionButton,
  BenchBand,
  Callout,
  CodeBlock,
  Figure,
  highlightBlock,
  IndexHeader,
  LabBench,
  LeaderRow,
  NotFoundPage,
  PageHeader,
  Pager,
  Prose,
  RelatedRows,
  Section,
  Shell,
  StateMark,
  TableBlock,
} from "../components";
import { playSound } from "../sound";
import type { BlockModel } from "../blocks";

type Models = Record<string, BlockModel>;

async function load(): Promise<Models> {
  const asm = `puts:
    push si
    push ax
.loop:
    lodsb
    or al, al
    jz .done
    mov ah, 0x0E
    int 0x10
    jmp .loop
.done:
    pop ax
    pop si
    ret`;
  return {
    code: await highlightBlock({
      code: 'from pathlib import Path\n\ndef suffix(name):\n    return Path(name).suffix.lower()',
      lang: "python",
      meta: 'title="sweep/classify.py"',
    }),
    numbered: await highlightBlock({
      code: asm,
      lang: "asm",
      meta: 'title="boot.asm" showLineNumbers {8-9}',
    }),
    tabs: await highlightBlock(
      { code: "def load_rules(path):\n    return {}", lang: "python", meta: 'title="rules.py"' },
      { code: "[rules.images]\nextensions = [\"png\"]", lang: "toml", meta: 'title="sweep.toml"' },
    ),
    terminal: await highlightBlock({
      code: "$ nasm -f bin boot.asm -o boot.bin\n$ qemu-system-x86_64 -drive format=raw,file=boot.bin\nSeaBIOS (version 1.16)",
      lang: "sh",
      meta: "terminal",
    }),
    diff: await highlightBlock({
      code: ' def load_rules(path):\n-    return DEFAULT_RULES\n+    with open(path, "rb") as f:\n+        return parse(f)',
      lang: "diff",
      meta: 'title="sweep/config.py"',
    }),
    long: await highlightBlock({
      code: Array.from({ length: 24 }, (_, i) => `line_${i + 1} = ${i + 1}`).join("\n"),
      lang: "python",
      meta: 'title="long.py"',
    }),
    tree: await highlightBlock({
      code: "project/\n├─ src/\n│  └─ main.asm\n└─ notes/",
      lang: "tree",
    }),
  };
}

function App() {
  const [models, setModels] = useState<Models | null>(null);
  const [view, setView] = useState<"index" | "404">("index");
  const [state, setState] = useState("QUEUED");
  const [log, setLog] = useState<string[]>([]);

  useEffect(() => {
    void load().then(setModels);
  }, []);
  useEffect(() => startBehavior(), []);

  if (!models) return <p style={{ padding: 24 }}>highlighting…</p>;

  const act = (name: string, from: string, to: string) => {
    if (state === from) {
      setState(to);
      setLog((l) => [`${name}: ${from} → ${to}`, ...l]);
      playSound("success");
    } else {
      setLog((l) => [`rejected: ${name} from ${state}`, ...l]);
      playSound("reject");
    }
  };

  return (
    <Shell
      site="lab"
      pages={[
        { label: "experiments", href: "#experiments" },
        { label: "notebook", href: "#notebook" },
      ]}
      currentPage="#experiments"
      toc={[
        { label: "Blocks", href: "#blocks", number: "01." },
        { label: "Bench", href: "#bench", number: "02." },
      ]}
      experiments={[{ label: "execution states", href: "#bench", number: "002" }]}
    >
      <div className="rv-meta" style={{ marginTop: -24, marginBottom: 24 }}>
        <button className="rv-toggle" aria-pressed={view === "index"} onClick={() => setView("index")}>
          page
        </button>
        <button className="rv-toggle" aria-pressed={view === "404"} onClick={() => setView("404")}>
          404
        </button>
      </div>
      {view === "404" ? (
        <NotFoundPage
          site="lab"
          line="this page moved, never existed, or I haven't built it yet."
          tryInstead={[{ label: "experiments", value: "start over", href: "#" }]}
        />
      ) : (
        <>
          <IndexHeader name="lab" line="things I run to see what happens." />
          <Section number="00." title="Leaders" index>
            <LeaderRow label="filename classifier" value="runs here" href="#a" />
            <LeaderRow label="execution states" value="simulated" href="#b" />
            <RelatedRows items={[{ title: "Sweep", site: "docs", href: "#" }]} />
          </Section>
          <PageHeader
            label="EXPERIMENT 002 · ORBIT"
            title="Execution states"
            line="a page header with a status word."
            meta={["simulated", "2 min", "[DATE]"]}
          />
          <Section number="01." title="Blocks" id="blocks">
            <Prose>
              <p>
                Inline code looks like <code>path.suffix</code>. Hover a block for copy.
              </p>
              <CodeBlock model={models.code} />
              <CodeBlock model={models.numbered} />
              <CodeBlock model={models.tabs} />
              <CodeBlock model={models.terminal} />
              <CodeBlock model={models.diff} />
              <CodeBlock model={models.long} />
              <CodeBlock model={models.tree} />
              <Callout>0x0D is a carriage return and 0x0A a line feed.</Callout>
              <Callout kind="important">Preview does not check conflicts.</Callout>
              <Callout kind="warning">There is no rollback.</Callout>
              <Callout kind="deprecated">Use the new command.</Callout>
              <Callout kind="til">Even pressing Enter has lore.</Callout>
              <Callout kind="careful">Use a VM image, never a real disk.</Callout>
              <TableBlock>
                <thead><tr><th>Register</th><th>Role here</th></tr></thead>
                <tbody><tr><td>si</td><td>next character</td></tr><tr><td>ah</td><td>BIOS function</td></tr></tbody>
              </TableBlock>
              <Figure caption="fig. 1 — caption">
                <div style={{ height: 120, background: "var(--block)", borderRadius: 10 }} />
              </Figure>
            </Prose>
          </Section>
          <Section number="02." title="Bench" id="bench">
            <LabBench caption="execution states" where="runs here">
              <BenchBand label="controls">
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                  <ActionButton primary state={state === "QUEUED" ? "accepted" : "rejected"} onClick={() => act("start", "QUEUED", "RUNNING")}>start</ActionButton>
                  <ActionButton state={state === "RUNNING" ? "accepted" : "rejected"} onClick={() => act("succeed", "RUNNING", "SUCCEEDED")}>succeed</ActionButton>
                  <ActionButton state={state === "RUNNING" ? "accepted" : "rejected"} onClick={() => act("fail", "RUNNING", "FAILED")}>fail</ActionButton>
                  <ActionButton onClick={() => { setState("QUEUED"); setLog([]); }}>new example</ActionButton>
                </div>
              </BenchBand>
              <BenchBand label="state">
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                  {["QUEUED", "RUNNING", "SUCCEEDED", "FAILED"].map((s) => (
                    <StateMark key={s} current={s === state}>{s}</StateMark>
                  ))}
                </div>
              </BenchBand>
              <BenchBand label="history">
                <div aria-live="polite">{log.length ? log.map((l) => <div key={l + Math.random()}>{l}</div>) : "nothing yet"}</div>
              </BenchBand>
            </LabBench>
          </Section>
          <Pager
            prev={{ label: "PREVIOUS", title: "Filename classifier", href: "#" }}
            next={{ label: "NEXT", title: "Boot sector", href: "#" }}
          />
        </>
      )}
    </Shell>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
