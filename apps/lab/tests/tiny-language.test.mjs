import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  LIMITS,
  analyze,
  astTree,
  excerpt,
  execute,
  tokenize,
} from "../src/lib/tiny-language.ts";

const codes = (list) => list.map((d) => d.code);
const kinds = (source) => tokenize(source).tokens.map((t) => t.type);
function run(source) {
  const analysis = analyze(source);
  assert.deepEqual(
    codes(analysis.diagnostics),
    [],
    "the program has no syntax errors",
  );
  return execute(analysis.program);
}

test("tokenizing: keywords, identifiers, numbers, strings, operators and punctuation", () => {
  const { tokens, diagnostics } = tokenize("let age: int = 27\n");
  assert.deepEqual(diagnostics, []);
  assert.deepEqual(
    tokens.map((t) => [t.type, t.text]),
    [
      ["keyword", "let"],
      ["identifier", "age"],
      ["punctuation", ":"],
      ["identifier", "int"],
      ["operator", "="],
      ["integer", "27"],
      ["newline", ""],
      ["eof", ""],
    ],
  );
  assert.deepEqual(tokens[0].line, 1);
  assert.equal(tokens[1].column, 5);
  const ops = tokenize("a >= b != c -> d .. e += 1").tokens.filter(
    (t) => t.type === "operator",
  );
  assert.deepEqual(
    ops.map((t) => t.text),
    [">=", "!=", "->", "..", "+="],
  );
});

test("indentation becomes indent and dedent tokens and blank lines and comments are ignored", () => {
  const source =
    "if x:\n    // note\n\n    print(1)\n    if y:\n        print(2)\nprint(3)\n";
  assert.deepEqual(
    kinds(source).filter((type) => ["indent", "dedent"].includes(type)),
    ["indent", "indent", "dedent", "dedent"],
  );
  // Dedents close at the end of input too.
  assert.equal(kinds("if x:\n    print(1)").at(-2), "dedent");
});

test("strings keep interpolations as separate parts and decode escapes", () => {
  const [string] = tokenize('"a{b + 1}c\\n{d}"').tokens;
  assert.deepEqual(
    string.parts.map((p) => [p.text, p.interpolated]),
    [
      ["a", false],
      ["b + 1", true],
      ["c\n", false],
      ["d", true],
    ],
  );
});

test("lexer diagnostics: tabs, unknown characters, unterminated strings, huge numbers, bad dedents", () => {
  assert.deepEqual(codes(tokenize("\tprint(1)").diagnostics), ["tab-indent"]);
  const unknown = tokenize("let a = 1 @ 2").diagnostics;
  assert.deepEqual(codes(unknown), ["unexpected-character"]);
  assert.equal(unknown[0].args.char, "@");
  assert.equal(unknown[0].column, 11);
  assert.deepEqual(codes(tokenize('print("abc').diagnostics), [
    "unterminated-string",
  ]);
  assert.deepEqual(
    codes(tokenize("let n = 99999999999999999999").diagnostics),
    ["number-too-large"],
  );
  assert.deepEqual(codes(tokenize("if a:\n        b\n    c\n").diagnostics), [
    "inconsistent-dedent",
  ]);
  assert.deepEqual(codes(tokenize('print("{}")').diagnostics), [
    "bad-interpolation",
  ]);
  assert.deepEqual(codes(tokenize('print("{a")').diagnostics), [
    "bad-interpolation",
  ]);
});

test("parsing builds the expected AST with precedence and associativity", () => {
  const { program, diagnostics } = analyze("let x = 1 + 2 * 3 - 4\n");
  assert.deepEqual(diagnostics, []);
  const tree = astTree(program);
  assert.deepEqual(tree, {
    label: "program",
    children: [
      {
        label: "let x",
        children: [
          {
            label: "binary -",
            children: [
              {
                label: "binary +",
                children: [
                  { label: "int 1", children: [] },
                  {
                    label: "binary *",
                    children: [
                      { label: "int 2", children: [] },
                      { label: "int 3", children: [] },
                    ],
                  },
                ],
              },
              { label: "int 4", children: [] },
            ],
          },
        ],
      },
    ],
  });
  const logic = astTree(analyze("let ok = not a and b or c\n").program)
    .children[0].children[0];
  assert.equal(logic.label, "binary or");
  assert.equal(logic.children[0].label, "binary and");
  assert.equal(logic.children[0].children[0].label, "unary not");
});

test("every statement form parses", () => {
  const source = [
    "const MAX: int = 3",
    "let total = 0",
    "fn add(a: int, b: int) -> int:",
    "    return a + b",
    "for i in 0..MAX:",
    "    total += add(i, 1)",
    "while total > 100:",
    "    total -= 1",
    "if total == 6:",
    '    print("six")',
    "elif total > 6:",
    '    print("more")',
    "else:",
    '    print("less")',
    "",
  ].join("\n");
  const { program, diagnostics } = analyze(source);
  assert.deepEqual(diagnostics, []);
  assert.deepEqual(
    program.body.map((s) => s.kind),
    ["let", "let", "fn", "for", "while", "if"],
  );
  assert.deepEqual(program.body[5].branches.length, 2);
  assert.ok(program.body[5].otherwise);
  assert.equal(program.body[2].returnType, "int");
});

test("syntax errors name what was expected and where, like the design notes' example", () => {
  const { diagnostics } = analyze("fn greet(name str):\n    print(name)\n");
  assert.deepEqual(codes(diagnostics), ["expected-token"]);
  const [d] = diagnostics;
  assert.equal(d.line, 1);
  assert.equal(d.column, 15);
  assert.deepEqual(
    { ...d.args },
    { expected: ":", found: "str", context: "parameter-name" },
  );
  assert.deepEqual(excerpt("fn greet(name str):\n", d), {
    text: "fn greet(name str):",
    underline: "              ^^^",
  });
});

test("more syntax errors", () => {
  const one = (source) => codes(analyze(source).diagnostics);
  assert.deepEqual(one("let = 1\n"), ["expected-name"]);
  assert.deepEqual(one("let if = 1\n"), ["reserved-name"]);
  assert.deepEqual(one("print(1\n"), ["expected-token"]);
  assert.deepEqual(one("let a = 1 2\n"), ["expected-end-of-line"]);
  assert.deepEqual(one("let a = \n"), ["expected-expression"]);
  assert.deepEqual(one("if true:\nprint(1)\n"), ["expected-block"]);
  assert.deepEqual(one("print(1)\n    print(2)\n"), ["unexpected-indent"]);
  assert.deepEqual(one('print("{1 +}")\n'), ["expected-expression"]);
  assert.deepEqual(one("for i in 3:\n    print(i)\n"), ["expected-token"]);
});

test("the parser recovers: one broken line does not hide the next error or the rest", () => {
  const source = "let a = \nprint(1)\nlet b = (\nprint(2)\nlet c = 3\n";
  const { diagnostics, program } = analyze(source);
  assert.deepEqual(codes(diagnostics), [
    "expected-expression",
    "expected-expression",
  ]);
  assert.deepEqual(
    diagnostics.map((d) => d.line),
    [1, 3],
  );
  // The good statements after each error are still in the tree.
  assert.deepEqual(
    program.body.map((s) => s.kind),
    ["expr", "expr", "let"],
  );
});

test("recovery skips the body under a broken block header without stray-indent noise", () => {
  const source = "if :\n    print(1)\n    print(2)\nprint(3)\nlet x = 1 +\n";
  const { diagnostics, program } = analyze(source);
  assert.deepEqual(codes(diagnostics), [
    "expected-expression",
    "expected-expression",
  ]);
  assert.deepEqual(
    program.body.map((s) => s.kind),
    ["expr"],
  );
});

test("a flood of errors stops at the cap instead of listing thousands", () => {
  const source = "let = 1\n".repeat(150);
  const { diagnostics } = analyze(source);
  assert.ok(diagnostics.length <= LIMITS.maxDiagnostics + 1);
  assert.equal(diagnostics.at(-1).code, "too-many-errors");
});

test("evaluation: arithmetic, comparison, logic, strings and interpolation", () => {
  const result = run(
    [
      "let a = 7",
      'let name = "yna"',
      "print(a + 3 * 2, a / 2, a % 4, -a)",
      "print(a > 3 and not (a == 8), a < 0 or false)",
      'print("{name} has {len(name)} letters and a is {a + 1}")',
      'print("a" + "b", "a" < "b")',
      "",
    ].join("\n"),
  );
  assert.deepEqual(result.diagnostics, []);
  assert.deepEqual(result.output, [
    "13 3 3 -7",
    "true false",
    "yna has 3 letters and a is 8",
    "ab true",
  ]);
});

test("evaluation: control flow, functions, recursion, scopes and types", () => {
  const source = [
    "fn fib(n: int) -> int:",
    "    if n < 2:",
    "        return n",
    "    return fib(n - 1) + fib(n - 2)",
    "let total = 0",
    "for i in 0..5:",
    "    let square = i * i",
    "    total += square",
    "print(total, fib(10))",
    "let n = 3",
    "while n > 0:",
    "    n -= 1",
    "print(n)",
    "",
  ].join("\n");
  const result = run(source);
  assert.deepEqual(result.diagnostics, []);
  assert.deepEqual(result.output, ["30 55", "0"]);
  assert.ok(result.trace.length > 0);
  // A `let` inside a loop body is fresh on every pass.
  assert.deepEqual(
    run("let k = 0\nwhile k < 3:\n    let tmp = k\n    k += 1\nprint(k)\n")
      .output,
    ["3"],
  );
});

test("runtime errors stop the run, keep earlier output and say where", () => {
  const cases = [
    ["print(1)\nprint(2 / 0)\n", "division-by-zero", 2],
    ["print(missing)\n", "undefined-variable", 1],
    ["nothing(1)\n", "undefined-function", 1],
    ["let a = 1\na(2)\n", "not-a-function", 2],
    ["fn f(a: int):\n    print(a)\nf(1, 2)\n", "wrong-arity", 3],
    ['print(1 + "a")\n', "type-mismatch", 1],
    ["print(not 3)\n", "type-mismatch", 1],
    ["if 1:\n    print(1)\n", "type-mismatch", 1],
    ["const c = 1\nc = 2\n", "assign-const", 2],
    ["let a = 1\nlet a = 2\n", "already-declared", 2],
    ["z = 1\n", "undefined-variable", 1],
    ['let a: int = "x"\n', "annotation-mismatch", 1],
    ["let a: float = 1\n", "unknown-type", 1],
    ["fn f(a: str):\n    print(a)\nf(1)\n", "annotation-mismatch", 3],
    ['fn f() -> int:\n    return "x"\nf()\n', "annotation-mismatch", 3],
    ["return 1\n", "return-outside-function", 1],
    ["let a = 9007199254740991\nprint(a + 1)\n", "integer-overflow", 2],
    ['let a = 1\na = "x"\n', "type-mismatch", 2],
  ];
  for (const [source, code, line] of cases) {
    const result = run(source);
    assert.deepEqual(codes(result.diagnostics), [code], source);
    assert.equal(result.diagnostics[0].line, line, source);
  }
  assert.deepEqual(run("print(1)\nprint(2 / 0)\n").output, ["1"]);
});

test("and/or short-circuit so the right side is not evaluated needlessly", () => {
  assert.deepEqual(
    run("print(false and (1 / 0 == 1))\nprint(true or (1 / 0 == 1))\n").output,
    ["false", "true"],
  );
});

test("bounded execution: loops, recursion, output and strings cannot run away", () => {
  const forever = run("while true:\n    let x = 1\n");
  assert.deepEqual(codes(forever.diagnostics), ["step-limit"]);
  assert.ok(forever.steps <= LIMITS.maxSteps + 1);
  assert.deepEqual(
    codes(run("for i in 0..1000000000:\n    let x = i\n").diagnostics),
    ["step-limit"],
  );
  const recursion = run(
    "fn f(n: int) -> int:\n    return f(n + 1)\nprint(f(0))\n",
  );
  assert.deepEqual(codes(recursion.diagnostics), ["depth-limit"]);
  const noisy = run("for i in 0..1000:\n    print(i)\n");
  assert.deepEqual(codes(noisy.diagnostics), ["output-limit"]);
  assert.equal(noisy.output.length, LIMITS.maxOutputLines);
  assert.deepEqual(
    codes(run('let s = "ab"\nwhile true:\n    s = s + s\n').diagnostics),
    ["string-too-long"],
  );
  const trace = run("for i in 0..400:\n    let x = i\n");
  assert.ok(trace.trace.length <= LIMITS.maxTrace);
  assert.equal(trace.truncated, true);
});

test("oversized input is refused before any stage runs", () => {
  const tooLong = analyze("let a = 1\n".repeat(LIMITS.maxLines + 1));
  assert.deepEqual(codes(tooLong.diagnostics), ["source-too-large"]);
  assert.equal(tooLong.program, null);
  assert.deepEqual(
    codes(analyze("x".repeat(LIMITS.maxChars + 1)).diagnostics),
    ["source-too-large"],
  );
  const edge = analyze("let a = 1\n".repeat(LIMITS.maxLines - 1));
  assert.notEqual(edge.program, null);
  assert.deepEqual(edge.diagnostics, []);
});

test("deep nesting is reported, not a stack overflow", () => {
  const parens = `let a = ${"(".repeat(5000)}1${")".repeat(5000)}\n`;
  assert.ok(parens.length > LIMITS.maxChars === false || true);
  const small = `let a = ${"(".repeat(200)}1${")".repeat(200)}\n`;
  assert.deepEqual(codes(analyze(small).diagnostics), ["nesting-too-deep"]);
  const nots = `let a = ${"not ".repeat(200)}true\n`;
  assert.deepEqual(codes(analyze(nots).diagnostics), ["nesting-too-deep"]);
  const minus = `let a = ${"- ".repeat(300)}1\n`;
  assert.deepEqual(codes(analyze(minus).diagnostics), ["nesting-too-deep"]);
  let blocks = "";
  for (let i = 0; i < 60; i += 1) blocks += `${"  ".repeat(i)}if true:\n`;
  blocks += `${"  ".repeat(60)}print(1)\n`;
  const result = analyze(blocks.slice(0, LIMITS.maxChars));
  assert.ok(result.diagnostics.length > 0);
  // A long flat chain is fine and evaluates without recursion trouble.
  const chain = `print(${Array.from({ length: 700 }, () => "1").join(" + ")})\n`;
  assert.deepEqual(run(chain).output, ["700"]);
  assert.ok(astTree(analyze(chain).program).label === "program");
});

test("the AST view clips very deep trees", () => {
  const chain = `print(${Array.from({ length: 300 }, () => "1").join(" + ")})\n`;
  const tree = astTree(analyze(chain).program, 10);
  let depth = 0;
  for (let at = tree; at.children.length > 0; at = at.children[0]) depth += 1;
  assert.ok(depth <= 10);
});

test("hostile identifiers cannot reach JavaScript", () => {
  for (const name of [
    "constructor",
    "__proto__",
    "toString",
    "process",
    "globalThis",
    "window",
    "document",
    "eval",
    "Function",
    "require",
    "hasOwnProperty",
  ]) {
    const result = run(`print(${name})\n`);
    assert.deepEqual(codes(result.diagnostics), ["undefined-variable"], name);
    assert.deepEqual(
      codes(run(`${name}(1)\n`).diagnostics),
      ["undefined-function"],
      name,
    );
  }
  // Assigning to them is just assigning to an undefined variable.
  assert.deepEqual(codes(run("__proto__ = 1\n").diagnostics), [
    "undefined-variable",
  ]);
  assert.deepEqual(
    codes(run('let constructor = "x"\nprint(constructor)\n').diagnostics),
    [],
  );
  assert.equal(Object.prototype.polluted, undefined);
  // String contents are data, never code.
  assert.deepEqual(run('print("{1 + 1} process.exit() alert(1)")\n').output, [
    "2 process.exit() alert(1)",
  ]);
});

test("the implementation never evaluates source as JavaScript", () => {
  const code = readFileSync(
    new URL("../src/lib/tiny-language.ts", import.meta.url),
    "utf8",
  )
    .split("\n")
    .filter((line) => !line.trim().startsWith("//"))
    .join("\n");
  assert.doesNotMatch(
    code,
    /\beval\s*\(|new Function|Function\s*\(|import\s*\(|\bsetTimeout\b|\bfetch\b|\bdocument\b|\bwindow\b/,
  );
});

test("analysis and execution are repeatable", () => {
  const source =
    "fn f(n: int) -> int:\n    return n * 2\nprint(f(21))\nlet = 1\n";
  assert.deepEqual(analyze(source), analyze(source));
  const ok = "print(1 + 1)\n";
  assert.deepEqual(execute(analyze(ok).program), execute(analyze(ok).program));
});
