// An educational interpreter for a small subset of the syntax sketched in the
// yanawa design notes (revision 7fd082e). It is NOT the yanawa compiler: yanawa
// has no verified compiler yet, so every rule here is this page's own reading of
// the notes. Three explicit stages, no JavaScript evaluation of the source:
//
//   tokenize -> parse (recursive descent, with recovery) -> evaluate (tree walk)
//
// Every stage is bounded: the source size, the nesting depth, the number of
// evaluated nodes, the call depth and the output are all capped, so no input can
// hang the page or overflow the stack. Diagnostics carry a code and arguments;
// the page words them from its locale's catalog.

export const LIMITS = {
  maxChars: 4000,
  maxLines: 200,
  maxTokens: 3000,
  /** Nesting of blocks and of expressions. */
  maxDepth: 24,
  maxIndentLevels: 12,
  maxDiagnostics: 12,
  /** Evaluated nodes in one run. */
  maxSteps: 20000,
  maxCallDepth: 30,
  maxOutputLines: 100,
  maxOutputChars: 4000,
  maxStringLength: 1000,
  maxTrace: 200,
  maxInterpolationChars: 200,
} as const;

// ---------------------------------------------------------------- diagnostics

export type DiagnosticCode =
  | "source-too-large"
  | "tab-indent"
  | "unexpected-character"
  | "unterminated-string"
  | "number-too-large"
  | "inconsistent-dedent"
  | "indent-too-deep"
  | "too-many-tokens"
  | "expected-token"
  | "expected-expression"
  | "expected-block"
  | "expected-name"
  | "expected-end-of-line"
  | "unexpected-indent"
  | "bad-interpolation"
  | "nesting-too-deep"
  | "too-many-errors"
  | "undefined-variable"
  | "already-declared"
  | "assign-const"
  | "undefined-function"
  | "not-a-function"
  | "wrong-arity"
  | "type-mismatch"
  | "annotation-mismatch"
  | "unknown-type"
  | "division-by-zero"
  | "integer-overflow"
  | "step-limit"
  | "depth-limit"
  | "output-limit"
  | "string-too-long"
  | "return-outside-function"
  | "reserved-name";

export type Stage = "lex" | "parse" | "run";

export interface Diagnostic {
  stage: Stage;
  code: DiagnosticCode;
  /** 1-based position of the first character. */
  line: number;
  column: number;
  /** Characters to underline, at least 1. */
  length: number;
  args: Readonly<Record<string, string | number>>;
}

function diagnostic(
  stage: Stage,
  code: DiagnosticCode,
  line: number,
  column: number,
  length = 1,
  args: Record<string, string | number> = {},
): Diagnostic {
  return { stage, code, line, column, length: Math.max(1, length), args };
}

// ---------------------------------------------------------------------- tokens

export type TokenType =
  | "keyword"
  | "identifier"
  | "integer"
  | "string"
  | "operator"
  | "punctuation"
  | "newline"
  | "indent"
  | "dedent"
  | "eof";

export interface StringPart {
  /** Literal text, or the source of an interpolated expression. */
  text: string;
  interpolated: boolean;
  /** Column of the first character of `text` in the source line. */
  column: number;
}

export interface Token {
  type: TokenType;
  text: string;
  line: number;
  column: number;
  /** For strings: the decoded literal text and interpolated expressions. */
  parts?: readonly StringPart[];
}

const KEYWORDS: ReadonlySet<string> = new Set([
  "let",
  "const",
  "fn",
  "if",
  "elif",
  "else",
  "while",
  "for",
  "in",
  "return",
  "and",
  "or",
  "not",
  "true",
  "false",
]);
const TYPE_NAMES: ReadonlySet<string> = new Set(["int", "str", "bool"]);
const OPERATORS = [
  "->",
  "..",
  "==",
  "!=",
  "<=",
  ">=",
  "+=",
  "-=",
  "*=",
  "/=",
  "+",
  "-",
  "*",
  "/",
  "%",
  "<",
  ">",
  "=",
];
const PUNCTUATION = new Set(["(", ")", ",", ":"]);
const MAX_INT = Number.MAX_SAFE_INTEGER;

export interface LexResult {
  tokens: Token[];
  diagnostics: Diagnostic[];
}

/** Splits a string literal body into text and `{expression}` parts. */
function splitString(
  body: string,
  line: number,
  startColumn: number,
): { parts: StringPart[]; error?: Diagnostic } {
  const parts: StringPart[] = [];
  let text = "";
  let textColumn = startColumn;
  for (let i = 0; i < body.length; i += 1) {
    const ch = body[i]!;
    if (ch === "\\" && i + 1 < body.length) {
      const next = body[i + 1]!;
      text += next === "n" ? "\n" : next === "t" ? "\t" : next;
      i += 1;
    } else if (ch === "{") {
      const close = body.indexOf("}", i);
      if (close === -1)
        return {
          parts,
          error: diagnostic(
            "lex",
            "bad-interpolation",
            line,
            startColumn + i,
            body.length - i,
          ),
        };
      const inner = body.slice(i + 1, close);
      if (
        inner.trim() === "" ||
        inner.length > LIMITS.maxInterpolationChars ||
        inner.includes("{")
      )
        return {
          parts,
          error: diagnostic(
            "lex",
            "bad-interpolation",
            line,
            startColumn + i,
            close - i + 1,
          ),
        };
      if (text) parts.push({ text, interpolated: false, column: textColumn });
      text = "";
      parts.push({
        text: inner,
        interpolated: true,
        column: startColumn + i + 1,
      });
      i = close;
      textColumn = startColumn + i + 1;
    } else {
      if (text === "") textColumn = startColumn + i;
      text += ch;
    }
  }
  if (text) parts.push({ text, interpolated: false, column: textColumn });
  return { parts };
}

/** Lexes one expression (an interpolation), without indentation handling. */
function lexInline(source: string, line: number, column: number): LexResult {
  const tokens: Token[] = [];
  const diagnostics: Diagnostic[] = [];
  scanLine(source, line, column, tokens, diagnostics);
  return { tokens, diagnostics };
}

function scanLine(
  text: string,
  line: number,
  offset: number,
  tokens: Token[],
  diagnostics: Diagnostic[],
): void {
  let i = 0;
  while (i < text.length) {
    const ch = text[i]!;
    const column = offset + i;
    if (ch === " ") {
      i += 1;
    } else if (ch === "\t") {
      diagnostics.push(diagnostic("lex", "tab-indent", line, column));
      i += 1;
    } else if (ch === "/" && text[i + 1] === "/") {
      return; // comment to the end of the line
    } else if (/[0-9]/.test(ch)) {
      let end = i;
      while (end < text.length && /[0-9]/.test(text[end]!)) end += 1;
      const digits = text.slice(i, end);
      if (Number(digits) > MAX_INT)
        diagnostics.push(
          diagnostic("lex", "number-too-large", line, column, digits.length),
        );
      tokens.push({ type: "integer", text: digits, line, column });
      i = end;
    } else if (/[A-Za-z_]/.test(ch)) {
      let end = i;
      while (end < text.length && /[A-Za-z0-9_]/.test(text[end]!)) end += 1;
      const word = text.slice(i, end);
      tokens.push({
        type: KEYWORDS.has(word) ? "keyword" : "identifier",
        text: word,
        line,
        column,
      });
      i = end;
    } else if (ch === '"') {
      let end = i + 1;
      while (end < text.length && text[end] !== '"')
        end += text[end] === "\\" ? 2 : 1;
      if (end >= text.length) {
        diagnostics.push(
          diagnostic(
            "lex",
            "unterminated-string",
            line,
            column,
            text.length - i,
          ),
        );
        // Keep what was read as a string so the parser does not report a second, misleading error.
        tokens.push({
          type: "string",
          text: text.slice(i),
          line,
          column,
          parts: [
            {
              text: text.slice(i + 1),
              interpolated: false,
              column: column + 1,
            },
          ],
        });
        return;
      }
      const body = text.slice(i + 1, end);
      const { parts, error } = splitString(body, line, column + 1);
      if (error) diagnostics.push(error);
      tokens.push({
        type: "string",
        text: text.slice(i, end + 1),
        line,
        column,
        parts,
      });
      i = end + 1;
    } else {
      const op = OPERATORS.find((candidate) => text.startsWith(candidate, i));
      if (op) {
        tokens.push({ type: "operator", text: op, line, column });
        i += op.length;
      } else if (PUNCTUATION.has(ch)) {
        tokens.push({ type: "punctuation", text: ch, line, column });
        i += 1;
      } else {
        diagnostics.push(
          diagnostic("lex", "unexpected-character", line, column, 1, {
            char: ch,
          }),
        );
        i += 1;
      }
    }
  }
}

export function tokenize(source: string): LexResult {
  const tokens: Token[] = [];
  const diagnostics: Diagnostic[] = [];
  if (
    source.length > LIMITS.maxChars ||
    source.split("\n").length > LIMITS.maxLines
  ) {
    diagnostics.push(
      diagnostic("lex", "source-too-large", 1, 1, 1, {
        chars: LIMITS.maxChars,
        lines: LIMITS.maxLines,
      }),
    );
    return {
      tokens: [{ type: "eof", text: "", line: 1, column: 1 }],
      diagnostics,
    };
  }
  const levels = [0];
  const lines = source.split("\n");
  let truncated = false;
  lines.forEach((raw, index) => {
    if (truncated) return;
    const line = index + 1;
    const text = raw.replace(/\r$/, "");
    const indent = text.length - text.trimStart().length;
    const leading = text.slice(0, indent);
    const body = text.trimStart();
    if (body === "" || body.startsWith("//")) return;
    if (leading.includes("\t"))
      diagnostics.push(
        diagnostic("lex", "tab-indent", line, leading.indexOf("\t") + 1),
      );
    const width = leading.replace(/\t/g, " ").length;
    const top = levels[levels.length - 1]!;
    if (width > top) {
      if (levels.length >= LIMITS.maxIndentLevels) {
        diagnostics.push(diagnostic("lex", "indent-too-deep", line, 1, width));
      } else {
        levels.push(width);
        tokens.push({ type: "indent", text: "", line, column: 1 });
      }
    } else if (width < top) {
      while (levels[levels.length - 1]! > width) {
        levels.pop();
        tokens.push({ type: "dedent", text: "", line, column: 1 });
      }
      if (levels[levels.length - 1]! !== width) {
        // Between two levels: report it and treat the line as part of the enclosing block.
        diagnostics.push(
          diagnostic("lex", "inconsistent-dedent", line, 1, width),
        );
      }
    }
    scanLine(body, line, indent + 1, tokens, diagnostics);
    tokens.push({ type: "newline", text: "", line, column: text.length + 1 });
    if (tokens.length > LIMITS.maxTokens) {
      diagnostics.push(
        diagnostic("lex", "too-many-tokens", line, 1, 1, {
          max: LIMITS.maxTokens,
        }),
      );
      truncated = true;
    }
  });
  const last = lines.length;
  while (levels.length > 1) {
    levels.pop();
    tokens.push({ type: "dedent", text: "", line: last, column: 1 });
  }
  tokens.push({ type: "eof", text: "", line: last, column: 1 });
  return { tokens, diagnostics };
}

// ------------------------------------------------------------------------- AST

export interface Located {
  line: number;
  column: number;
}

export type Expr =
  | (Located & { kind: "int"; value: number })
  | (Located & { kind: "bool"; value: boolean })
  | (Located & { kind: "string"; parts: readonly (string | Expr)[] })
  | (Located & { kind: "name"; name: string })
  | (Located & { kind: "unary"; op: "-" | "not"; operand: Expr })
  | (Located & { kind: "binary"; op: string; left: Expr; right: Expr })
  | (Located & { kind: "call"; callee: string; args: readonly Expr[] });

export interface Param {
  name: string;
  typeName: string | null;
}

export type Stmt =
  | (Located & {
      kind: "let";
      name: string;
      typeName: string | null;
      value: Expr;
      constant: boolean;
    })
  | (Located & { kind: "assign"; name: string; op: string; value: Expr })
  | (Located & {
      kind: "fn";
      name: string;
      params: readonly Param[];
      returnType: string | null;
      body: readonly Stmt[];
    })
  | (Located & {
      kind: "if";
      branches: readonly { cond: Expr; body: readonly Stmt[] }[];
      otherwise: readonly Stmt[] | null;
    })
  | (Located & { kind: "while"; cond: Expr; body: readonly Stmt[] })
  | (Located & {
      kind: "for";
      name: string;
      from: Expr;
      to: Expr;
      body: readonly Stmt[];
    })
  | (Located & { kind: "return"; value: Expr | null })
  | (Located & { kind: "expr"; value: Expr });

export interface Program {
  body: readonly Stmt[];
}

export interface ParseResult {
  program: Program;
  diagnostics: Diagnostic[];
}

class ParseError extends Error {
  readonly found: Diagnostic;
  constructor(found: Diagnostic) {
    super(found.code);
    this.found = found;
  }
}

const COMPARISON = new Set(["==", "!=", "<", "<=", ">", ">="]);
const ASSIGN = new Set(["=", "+=", "-=", "*=", "/="]);

class Parser {
  private at = 0;
  private depth = 0;
  readonly diagnostics: Diagnostic[] = [];
  private readonly tokens: readonly Token[];
  constructor(tokens: readonly Token[]) {
    this.tokens = tokens;
  }

  private get tok(): Token {
    return this.tokens[Math.min(this.at, this.tokens.length - 1)]!;
  }
  private peek(offset = 1): Token {
    return this.tokens[Math.min(this.at + offset, this.tokens.length - 1)]!;
  }
  private advance(): Token {
    const token = this.tok;
    if (this.at < this.tokens.length - 1) this.at += 1;
    return token;
  }
  private is(type: TokenType, text?: string): boolean {
    return (
      this.tok.type === type && (text === undefined || this.tok.text === text)
    );
  }
  private fail(
    code: DiagnosticCode,
    args: Record<string, string | number> = {},
    token = this.tok,
  ): never {
    const length = Math.max(1, token.text.length);
    throw new ParseError(
      diagnostic("parse", code, token.line, token.column, length, args),
    );
  }
  /** Source text of a token, or `~type` for tokens that have none (the page words those). */
  private describe(token: Token): string {
    return ["newline", "eof", "indent", "dedent"].includes(token.type)
      ? `~${token.type}`
      : token.text;
  }
  private expect(type: TokenType, text: string, context = ""): Token {
    if (this.is(type, text)) return this.advance();
    return this.fail("expected-token", {
      expected: text,
      found: this.describe(this.tok),
      context,
    });
  }
  private enter(): void {
    this.depth += 1;
    if (this.depth > LIMITS.maxDepth)
      this.fail("nesting-too-deep", { max: LIMITS.maxDepth });
  }
  private leave(): void {
    this.depth -= 1;
  }

  parseProgram(): Program {
    const body: Stmt[] = [];
    while (!this.is("eof")) {
      if (this.diagnostics.length >= LIMITS.maxDiagnostics) {
        const t = this.tok;
        this.diagnostics.push(
          diagnostic("parse", "too-many-errors", t.line, t.column, 1, {
            max: LIMITS.maxDiagnostics,
          }),
        );
        break;
      }
      this.statementInto(body);
    }
    return { body };
  }

  /** Parses a lone expression, for string interpolation. */
  parseInlineExpression(): Expr | null {
    try {
      const expr = this.expression();
      if (!this.is("eof"))
        this.fail("expected-end-of-line", { found: this.describe(this.tok) });
      return expr;
    } catch (error) {
      if (error instanceof ParseError) {
        this.diagnostics.push(error.found);
        return null;
      }
      throw error;
    }
  }

  private statementInto(out: Stmt[]): void {
    try {
      if (this.is("indent")) this.fail("unexpected-indent");
      if (this.is("dedent")) {
        this.advance(); // a stray dedent after recovery
        return;
      }
      out.push(this.statement());
    } catch (error) {
      if (!(error instanceof ParseError)) throw error;
      this.diagnostics.push(error.found);
      this.synchronize();
    }
  }

  /** Skips to the end of the broken line, and over the block indented under it. */
  private synchronize(): void {
    let nesting = 0;
    while (!this.is("eof")) {
      if (this.is("indent")) nesting += 1;
      else if (this.is("dedent")) {
        if (nesting === 0) return; // the block that contains the broken line ends here
        nesting -= 1;
        if (nesting === 0) {
          this.advance();
          return;
        }
      } else if (this.is("newline") && nesting === 0) {
        this.advance();
        // A broken header leaves its body behind; skip it instead of reporting it as stray.
        if (this.is("indent")) continue;
        return;
      }
      this.advance();
    }
  }

  private endOfLine(): void {
    if (this.is("newline")) this.advance();
    else if (!this.is("eof") && !this.is("dedent"))
      this.fail("expected-end-of-line", { found: this.describe(this.tok) });
  }

  private block(context: string): Stmt[] {
    if (!this.is("newline")) this.fail("expected-block", { context });
    this.advance();
    if (!this.is("indent")) this.fail("expected-block", { context });
    this.advance();
    this.enter();
    const body: Stmt[] = [];
    while (!this.is("dedent") && !this.is("eof")) {
      if (this.diagnostics.length >= LIMITS.maxDiagnostics) break;
      this.statementInto(body);
    }
    if (this.is("dedent")) this.advance();
    this.leave();
    return body;
  }

  private name(what: string): string {
    if (this.tok.type === "keyword")
      this.fail("reserved-name", { word: this.tok.text });
    if (!this.is("identifier"))
      this.fail("expected-name", { what, found: this.describe(this.tok) });
    return this.advance().text;
  }

  private typeAnnotation(): string | null {
    if (!this.is("punctuation", ":")) return null;
    this.advance();
    return this.name("type");
  }

  private statement(): Stmt {
    const t = this.tok;
    const where = { line: t.line, column: t.column };
    this.enter();
    try {
      if (t.type === "keyword") {
        switch (t.text) {
          case "let":
          case "const": {
            this.advance();
            const name = this.name("variable");
            const typeName = this.typeAnnotation();
            this.expect("operator", "=", t.text);
            const value = this.expression();
            this.endOfLine();
            return {
              kind: "let",
              ...where,
              name,
              typeName,
              value,
              constant: t.text === "const",
            };
          }
          case "fn": {
            this.advance();
            const name = this.name("function");
            this.expect("punctuation", "(", "function-name");
            const params: Param[] = [];
            if (!this.is("punctuation", ")")) {
              do {
                const pname = this.name("parameter");
                if (!this.is("punctuation", ":"))
                  this.fail("expected-token", {
                    expected: ":",
                    found: this.describe(this.tok),
                    context: "parameter-name",
                  });
                params.push({ name: pname, typeName: this.typeAnnotation() });
                if (!this.is("punctuation", ",")) break;
                this.advance();
              } while (true);
            }
            this.expect("punctuation", ")", "parameters");
            let returnType: string | null = null;
            if (this.is("operator", "->")) {
              this.advance();
              returnType = this.name("type");
            }
            this.expect("punctuation", ":", "function-body");
            const body = this.block("fn");
            return { kind: "fn", ...where, name, params, returnType, body };
          }
          case "if": {
            this.advance();
            const branches: { cond: Expr; body: Stmt[] }[] = [];
            let cond = this.expression();
            this.expect("punctuation", ":", "condition");
            branches.push({ cond, body: this.block("if") });
            while (this.is("keyword", "elif")) {
              this.advance();
              cond = this.expression();
              this.expect("punctuation", ":", "condition");
              branches.push({ cond, body: this.block("elif") });
            }
            let otherwise: Stmt[] | null = null;
            if (this.is("keyword", "else")) {
              this.advance();
              this.expect("punctuation", ":", "else");
              otherwise = this.block("else");
            }
            return { kind: "if", ...where, branches, otherwise };
          }
          case "while": {
            this.advance();
            const cond = this.expression();
            this.expect("punctuation", ":", "condition");
            return { kind: "while", ...where, cond, body: this.block("while") };
          }
          case "for": {
            this.advance();
            const name = this.name("loop-variable");
            this.expect("keyword", "in", "loop-variable");
            const from = this.expression();
            this.expect("operator", "..", "range-bounds");
            const to = this.expression();
            this.expect("punctuation", ":", "range");
            return {
              kind: "for",
              ...where,
              name,
              from,
              to,
              body: this.block("for"),
            };
          }
          case "return": {
            this.advance();
            const value =
              this.is("newline") || this.is("eof") || this.is("dedent")
                ? null
                : this.expression();
            this.endOfLine();
            return { kind: "return", ...where, value };
          }
          default:
            break;
        }
      }
      if (
        t.type === "identifier" &&
        this.peek().type === "operator" &&
        ASSIGN.has(this.peek().text)
      ) {
        const name = this.advance().text;
        const op = this.advance().text;
        const value = this.expression();
        this.endOfLine();
        return { kind: "assign", ...where, name, op, value };
      }
      const value = this.expression();
      this.endOfLine();
      return { kind: "expr", ...where, value };
    } finally {
      this.leave();
    }
  }

  private expression(): Expr {
    this.enter();
    try {
      return this.or();
    } finally {
      this.leave();
    }
  }

  private binaryLevel(
    next: () => Expr,
    matches: (token: Token) => boolean,
  ): Expr {
    let left = next();
    while (matches(this.tok)) {
      const op = this.advance();
      const right = next();
      left = {
        kind: "binary",
        op: op.text,
        left,
        right,
        line: op.line,
        column: op.column,
      };
    }
    return left;
  }
  private or(): Expr {
    return this.binaryLevel(
      () => this.and(),
      (t) => t.type === "keyword" && t.text === "or",
    );
  }
  private and(): Expr {
    return this.binaryLevel(
      () => this.not(),
      (t) => t.type === "keyword" && t.text === "and",
    );
  }
  private not(): Expr {
    if (this.is("keyword", "not")) {
      const t = this.advance();
      this.enter();
      try {
        return {
          kind: "unary",
          op: "not",
          operand: this.not(),
          line: t.line,
          column: t.column,
        };
      } finally {
        this.leave();
      }
    }
    return this.comparison();
  }
  private comparison(): Expr {
    return this.binaryLevel(
      () => this.sum(),
      (t) => t.type === "operator" && COMPARISON.has(t.text),
    );
  }
  private sum(): Expr {
    return this.binaryLevel(
      () => this.product(),
      (t) => t.type === "operator" && (t.text === "+" || t.text === "-"),
    );
  }
  private product(): Expr {
    return this.binaryLevel(
      () => this.unary(),
      (t) =>
        t.type === "operator" &&
        (t.text === "*" || t.text === "/" || t.text === "%"),
    );
  }
  private unary(): Expr {
    if (this.is("operator", "-")) {
      const t = this.advance();
      this.enter();
      try {
        return {
          kind: "unary",
          op: "-",
          operand: this.unary(),
          line: t.line,
          column: t.column,
        };
      } finally {
        this.leave();
      }
    }
    return this.primary();
  }

  private primary(): Expr {
    const t = this.tok;
    const where = { line: t.line, column: t.column };
    switch (t.type) {
      case "integer":
        this.advance();
        return {
          kind: "int",
          value: Math.min(Number(t.text), MAX_INT),
          ...where,
        };
      case "string": {
        this.advance();
        const parts: (string | Expr)[] = [];
        for (const part of t.parts ?? []) {
          if (!part.interpolated) {
            parts.push(part.text);
            continue;
          }
          const lexed = lexInline(part.text, t.line, part.column);
          this.diagnostics.push(...lexed.diagnostics);
          const inner = new Parser([
            ...lexed.tokens,
            {
              type: "eof",
              text: "",
              line: t.line,
              column: part.column + part.text.length,
            },
          ]);
          inner.depth = this.depth;
          const expr = inner.parseInlineExpression();
          this.diagnostics.push(...inner.diagnostics);
          if (expr) parts.push(expr);
        }
        return { kind: "string", parts, ...where };
      }
      case "keyword":
        if (t.text === "true" || t.text === "false") {
          this.advance();
          return { kind: "bool", value: t.text === "true", ...where };
        }
        break;
      case "identifier": {
        this.advance();
        if (this.is("punctuation", "(")) {
          this.advance();
          const args: Expr[] = [];
          if (!this.is("punctuation", ")")) {
            do {
              args.push(this.expression());
              if (!this.is("punctuation", ",")) break;
              this.advance();
            } while (true);
          }
          this.expect("punctuation", ")", "arguments");
          return { kind: "call", callee: t.text, args, ...where };
        }
        return { kind: "name", name: t.text, ...where };
      }
      case "punctuation":
        if (t.text === "(") {
          this.advance();
          const inside = this.expression();
          this.expect("punctuation", ")", "parenthesis");
          return inside;
        }
        break;
      default:
        break;
    }
    return this.fail("expected-expression", { found: this.describe(t) });
  }
}

export function parse(tokens: readonly Token[]): ParseResult {
  const parser = new Parser(tokens);
  const program = parser.parseProgram();
  return { program, diagnostics: parser.diagnostics };
}

export interface Analysis {
  tokens: Token[];
  program: Program | null;
  /** Lexer and parser diagnostics, in source order. */
  diagnostics: Diagnostic[];
}

/**
 * Tokenizes and parses. The program is `null` only when the source is too large;
 * with syntax errors it holds whatever parsed, and `diagnostics` says what did not.
 */
export function analyze(source: string): Analysis {
  const lexed = tokenize(source);
  if (lexed.diagnostics.some((d) => d.code === "source-too-large"))
    return {
      tokens: lexed.tokens,
      program: null,
      diagnostics: lexed.diagnostics,
    };
  const parsed = parse(lexed.tokens);
  const diagnostics = [...lexed.diagnostics, ...parsed.diagnostics].sort(
    (a, b) => a.line - b.line || a.column - b.column,
  );
  return { tokens: lexed.tokens, program: parsed.program, diagnostics };
}

// ------------------------------------------------------------------- AST view

export interface TreeNode {
  label: string;
  children: TreeNode[];
}

const node = (label: string, children: TreeNode[] = []): TreeNode => ({
  label,
  children,
});

function exprTree(expr: Expr): TreeNode {
  switch (expr.kind) {
    case "int":
      return node(`int ${expr.value}`);
    case "bool":
      return node(`bool ${expr.value}`);
    case "name":
      return node(`name ${expr.name}`);
    case "string":
      return node(
        "string",
        expr.parts.map((part) =>
          typeof part === "string"
            ? node(`text ${JSON.stringify(part)}`)
            : node("interpolation", [exprTree(part)]),
        ),
      );
    case "unary":
      return node(`unary ${expr.op}`, [exprTree(expr.operand)]);
    case "binary":
      return node(`binary ${expr.op}`, [
        exprTree(expr.left),
        exprTree(expr.right),
      ]);
    case "call":
      return node(`call ${expr.callee}`, expr.args.map(exprTree));
  }
}

function stmtTree(stmt: Stmt): TreeNode {
  const body = (list: readonly Stmt[]) => list.map(stmtTree);
  switch (stmt.kind) {
    case "let":
      return node(
        `${stmt.constant ? "const" : "let"} ${stmt.name}${stmt.typeName ? `: ${stmt.typeName}` : ""}`,
        [exprTree(stmt.value)],
      );
    case "assign":
      return node(`assign ${stmt.name} ${stmt.op}`, [exprTree(stmt.value)]);
    case "fn":
      return node(
        `fn ${stmt.name}(${stmt.params.map((p) => (p.typeName ? `${p.name}: ${p.typeName}` : p.name)).join(", ")})${stmt.returnType ? ` -> ${stmt.returnType}` : ""}`,
        body(stmt.body),
      );
    case "if":
      return node("if", [
        ...stmt.branches.map((b, i) =>
          node(i === 0 ? "then" : "elif", [
            exprTree(b.cond),
            node("block", body(b.body)),
          ]),
        ),
        ...(stmt.otherwise ? [node("else", body(stmt.otherwise))] : []),
      ]);
    case "while":
      return node("while", [
        exprTree(stmt.cond),
        node("block", body(stmt.body)),
      ]);
    case "for":
      return node(`for ${stmt.name}`, [
        node("from", [exprTree(stmt.from)]),
        node("to", [exprTree(stmt.to)]),
        node("block", body(stmt.body)),
      ]);
    case "return":
      return node("return", stmt.value ? [exprTree(stmt.value)] : []);
    case "expr":
      return node("expression", [exprTree(stmt.value)]);
  }
}

/** The program as a plain tree of labels, for display. Trees deeper than `maxDepth` end in an ellipsis node. */
export function astTree(program: Program, maxDepth = 40): TreeNode {
  const clip = (tree: TreeNode, depth: number): TreeNode =>
    depth >= maxDepth
      ? node(tree.children.length > 0 ? `${tree.label} …` : tree.label)
      : node(
          tree.label,
          tree.children.map((child) => clip(child, depth + 1)),
        );
  return clip(node("program", program.body.map(stmtTree)), 0);
}

// ------------------------------------------------------------------ evaluation

type Value = number | string | boolean | undefined;

export interface TraceEvent {
  line: number;
  kind: "let" | "assign" | "print" | "call" | "return" | "branch" | "loop";
  /** Short fixed-form description; identifiers and values only, never prose. */
  detail: string;
}

export interface RunResult {
  output: string[];
  diagnostics: Diagnostic[];
  trace: TraceEvent[];
  steps: number;
  /** True when the run was stopped by the output or trace caps rather than finishing. */
  truncated: boolean;
}

class RuntimeFailure extends Error {
  readonly found: Diagnostic;
  constructor(found: Diagnostic) {
    super(found.code);
    this.found = found;
  }
}
class ReturnSignal {
  readonly value: Value;
  constructor(value: Value) {
    this.value = value;
  }
}

interface Slot {
  value: Value;
  constant: boolean;
}
type Scope = Map<string, Slot>;

interface FnDef {
  stmt: Extract<Stmt, { kind: "fn" }>;
}

const typeOf = (value: Value): string =>
  typeof value === "number"
    ? "int"
    : typeof value === "string"
      ? "str"
      : typeof value === "boolean"
        ? "bool"
        : "nothing";

function show(value: Value): string {
  return value === undefined
    ? "nothing"
    : typeof value === "string"
      ? value
      : String(value);
}

class Interpreter {
  steps = 0;
  depth = 0;
  readonly output: string[] = [];
  outputChars = 0;
  readonly trace: TraceEvent[] = [];
  truncated = false;
  private readonly functions = new Map<string, FnDef>();
  /** One list of nested block scopes per active call; the first call is the program itself. */
  private frames: Scope[][] = [];

  run(program: Program): void {
    for (const stmt of program.body)
      if (stmt.kind === "fn") this.functions.set(stmt.name, { stmt });
    this.frames = [[new Map()]];
    for (const stmt of program.body) this.exec(stmt);
  }

  private get scopes(): Scope[] {
    return this.frames[this.frames.length - 1]!;
  }
  private get scope(): Scope {
    return this.scopes[this.scopes.length - 1]!;
  }
  private find(name: string): Slot | undefined {
    // The innermost scope of this call outwards, then the program's own scopes.
    for (const list of [this.scopes, this.frames[0]!])
      for (let i = list.length - 1; i >= 0; i -= 1) {
        const slot = list[i]!.get(name);
        if (slot) return slot;
      }
    return undefined;
  }
  private fail(
    code: DiagnosticCode,
    at: Located,
    args: Record<string, string | number> = {},
    length = 1,
  ): never {
    throw new RuntimeFailure(
      diagnostic("run", code, at.line, at.column, length, args),
    );
  }
  private tick(at: Located): void {
    this.steps += 1;
    if (this.steps > LIMITS.maxSteps)
      this.fail("step-limit", at, { max: LIMITS.maxSteps });
  }
  private note(line: number, kind: TraceEvent["kind"], detail: string): void {
    if (this.trace.length < LIMITS.maxTrace)
      this.trace.push({ line, kind, detail });
    else this.truncated = true;
  }
  private lookup(name: string, at: Located): Slot {
    const slot = this.find(name);
    if (slot) return slot;
    return this.fail("undefined-variable", at, { name }, name.length);
  }

  /** Runs a block in a scope of its own, so a `let` inside a loop is fresh on every pass. */
  private execBlock(
    body: readonly Stmt[],
    loopVariable?: [string, number],
  ): void {
    const scope: Scope = new Map();
    if (loopVariable)
      scope.set(loopVariable[0], { value: loopVariable[1], constant: false });
    this.scopes.push(scope);
    try {
      for (const stmt of body) this.exec(stmt);
    } finally {
      this.scopes.pop();
    }
  }

  private checkType(
    typeName: string | null,
    value: Value,
    at: Located,
    what: string,
  ): void {
    if (typeName === null) return;
    if (!TYPE_NAMES.has(typeName))
      this.fail("unknown-type", at, { type: typeName }, typeName.length);
    if (typeOf(value) !== typeName)
      this.fail("annotation-mismatch", at, {
        what,
        expected: typeName,
        found: typeOf(value),
      });
  }

  private exec(stmt: Stmt): void {
    this.tick(stmt);
    switch (stmt.kind) {
      case "let": {
        const value = this.value(stmt.value);
        this.checkType(stmt.typeName, value, stmt, stmt.name);
        if (this.scope.has(stmt.name))
          this.fail("already-declared", stmt, { name: stmt.name });
        this.scope.set(stmt.name, { value, constant: stmt.constant });
        this.note(stmt.line, "let", `${stmt.name} = ${show(value)}`);
        return;
      }
      case "assign": {
        const slot = this.lookup(stmt.name, stmt);
        if (slot.constant)
          this.fail(
            "assign-const",
            stmt,
            { name: stmt.name },
            stmt.name.length,
          );
        const right = this.value(stmt.value);
        const next =
          stmt.op === "="
            ? right
            : this.binary(stmt.op.slice(0, -1), slot.value, right, stmt);
        if (slot.value !== undefined && typeOf(slot.value) !== typeOf(next))
          this.fail("type-mismatch", stmt, {
            op: stmt.op,
            left: typeOf(slot.value),
            right: typeOf(next),
          });
        slot.value = next;
        this.note(stmt.line, "assign", `${stmt.name} = ${show(next)}`);
        return;
      }
      case "fn":
        if (this.frames.length === 1 && this.scopes.length === 1) return; // hoisted by `run`
        this.functions.set(stmt.name, { stmt });
        return;
      case "if": {
        for (const [index, branch] of stmt.branches.entries()) {
          const cond = this.value(branch.cond);
          if (typeof cond !== "boolean")
            this.fail("type-mismatch", branch.cond, {
              op: "if",
              left: typeOf(cond),
              right: "bool",
            });
          if (cond) {
            this.note(stmt.line, "branch", index === 0 ? "if" : "elif");
            this.execBlock(branch.body);
            return;
          }
        }
        if (stmt.otherwise) {
          this.note(stmt.line, "branch", "else");
          this.execBlock(stmt.otherwise);
        }
        return;
      }
      case "while": {
        for (;;) {
          this.tick(stmt);
          const cond = this.value(stmt.cond);
          if (typeof cond !== "boolean")
            this.fail("type-mismatch", stmt.cond, {
              op: "while",
              left: typeOf(cond),
              right: "bool",
            });
          if (!cond) return;
          this.note(stmt.line, "loop", "while");
          this.execBlock(stmt.body);
        }
      }
      case "for": {
        const from = this.value(stmt.from);
        const to = this.value(stmt.to);
        if (typeof from !== "number" || typeof to !== "number")
          this.fail("type-mismatch", stmt, {
            op: "..",
            left: typeOf(from),
            right: typeOf(to),
          });
        // The range excludes its end, like `0..10` in the notes' loop example.
        for (let i = from; i < to; i += 1) {
          this.tick(stmt);
          this.note(stmt.line, "loop", `${stmt.name} = ${i}`);
          this.execBlock(stmt.body, [stmt.name, i]);
        }
        return;
      }
      case "return": {
        if (this.frames.length === 1)
          this.fail("return-outside-function", stmt, {}, 6);
        const value = stmt.value ? this.value(stmt.value) : undefined;
        this.note(stmt.line, "return", show(value));
        throw new ReturnSignal(value);
      }
      case "expr":
        this.value(stmt.value);
        return;
    }
  }

  private emit(text: string, at: Located): void {
    if (
      this.output.length >= LIMITS.maxOutputLines ||
      this.outputChars + text.length > LIMITS.maxOutputChars
    )
      this.fail("output-limit", at, {
        lines: LIMITS.maxOutputLines,
        chars: LIMITS.maxOutputChars,
      });
    this.output.push(text);
    this.outputChars += text.length;
  }

  private call(expr: Extract<Expr, { kind: "call" }>): Value {
    const args = expr.args.map((arg) => this.value(arg));
    if (expr.callee === "print") {
      const text = args.map(show).join(" ");
      this.emit(text, expr);
      this.note(
        expr.line,
        "print",
        text.length > 40 ? `${text.slice(0, 40)}…` : text,
      );
      return undefined;
    }
    if (expr.callee === "len") {
      if (args.length !== 1)
        this.fail("wrong-arity", expr, {
          name: "len",
          expected: 1,
          found: args.length,
        });
      if (typeof args[0] !== "string")
        this.fail("type-mismatch", expr, {
          op: "len",
          left: typeOf(args[0]),
          right: "str",
        });
      return args[0].length;
    }
    const fn = this.functions.get(expr.callee);
    if (!fn) {
      if (this.find(expr.callee))
        this.fail(
          "not-a-function",
          expr,
          { name: expr.callee },
          expr.callee.length,
        );
      this.fail(
        "undefined-function",
        expr,
        { name: expr.callee },
        expr.callee.length,
      );
    }
    const { params, body, returnType } = fn.stmt;
    if (params.length !== args.length)
      this.fail(
        "wrong-arity",
        expr,
        { name: expr.callee, expected: params.length, found: args.length },
        expr.callee.length,
      );
    if (this.depth >= LIMITS.maxCallDepth)
      this.fail(
        "depth-limit",
        expr,
        { max: LIMITS.maxCallDepth },
        expr.callee.length,
      );
    const frame: Scope = new Map();
    params.forEach((param, i) => {
      this.checkType(param.typeName, args[i], expr, param.name);
      frame.set(param.name, { value: args[i], constant: false });
    });
    this.note(
      expr.line,
      "call",
      `${expr.callee}(${args.map(show).join(", ")})`,
    );
    this.frames.push([frame]);
    this.depth += 1;
    let result: Value;
    try {
      this.execBlock(body);
    } catch (signal) {
      if (!(signal instanceof ReturnSignal)) throw signal;
      result = signal.value;
    } finally {
      this.depth -= 1;
      this.frames.pop();
    }
    this.checkType(returnType, result, expr, expr.callee);
    return result;
  }

  private binary(op: string, left: Value, right: Value, at: Located): Value {
    if (op === "==" || op === "!=") {
      if (typeOf(left) !== typeOf(right))
        this.fail("type-mismatch", at, {
          op,
          left: typeOf(left),
          right: typeOf(right),
        });
      return op === "==" ? left === right : left !== right;
    }
    if (typeof left === "string" && typeof right === "string" && op === "+") {
      if (left.length + right.length > LIMITS.maxStringLength)
        this.fail("string-too-long", at, { max: LIMITS.maxStringLength });
      return left + right;
    }
    if (
      typeof left === "string" &&
      typeof right === "string" &&
      ["<", "<=", ">", ">="].includes(op)
    )
      return op === "<"
        ? left < right
        : op === "<="
          ? left <= right
          : op === ">"
            ? left > right
            : left >= right;
    if (typeof left !== "number" || typeof right !== "number")
      this.fail("type-mismatch", at, {
        op,
        left: typeOf(left),
        right: typeOf(right),
      });
    let result: number;
    switch (op) {
      case "+":
        result = left + right;
        break;
      case "-":
        result = left - right;
        break;
      case "*":
        result = left * right;
        break;
      case "/":
      case "%":
        if (right === 0) this.fail("division-by-zero", at, { op });
        result = op === "/" ? Math.trunc(left / right) : left % right;
        break;
      case "<":
        return left < right;
      case "<=":
        return left <= right;
      case ">":
        return left > right;
      case ">=":
        return left >= right;
      default:
        return this.fail("type-mismatch", at, {
          op,
          left: "int",
          right: "int",
        });
    }
    if (!Number.isSafeInteger(result))
      this.fail("integer-overflow", at, { max: MAX_INT });
    return result;
  }

  private value(expr: Expr): Value {
    this.tick(expr);
    switch (expr.kind) {
      case "int":
      case "bool":
        return expr.value;
      case "name":
        return this.lookup(expr.name, expr).value;
      case "string": {
        let out = "";
        for (const part of expr.parts) {
          out += typeof part === "string" ? part : show(this.value(part));
          if (out.length > LIMITS.maxStringLength)
            this.fail("string-too-long", expr, { max: LIMITS.maxStringLength });
        }
        return out;
      }
      case "unary": {
        const value = this.value(expr.operand);
        if (expr.op === "not") {
          if (typeof value !== "boolean")
            this.fail("type-mismatch", expr, {
              op: "not",
              left: typeOf(value),
              right: "bool",
            });
          return !value;
        }
        if (typeof value !== "number")
          this.fail("type-mismatch", expr, {
            op: "-",
            left: typeOf(value),
            right: "int",
          });
        return -value;
      }
      case "binary": {
        if (expr.op === "and" || expr.op === "or") {
          const left = this.value(expr.left);
          if (typeof left !== "boolean")
            this.fail("type-mismatch", expr, {
              op: expr.op,
              left: typeOf(left),
              right: "bool",
            });
          // Short-circuit like the operators in the notes' conditions.
          if (expr.op === "and" ? !left : left) return left;
          const right = this.value(expr.right);
          if (typeof right !== "boolean")
            this.fail("type-mismatch", expr, {
              op: expr.op,
              left: "bool",
              right: typeOf(right),
            });
          return right;
        }
        return this.binary(
          expr.op,
          this.value(expr.left),
          this.value(expr.right),
          expr,
        );
      }
      case "call":
        return this.call(expr);
    }
  }
}

/** Runs a program. A runtime error stops the run and is reported; output so far is kept. */
export function execute(program: Program): RunResult {
  const interpreter = new Interpreter();
  const diagnostics: Diagnostic[] = [];
  try {
    interpreter.run(program);
  } catch (error) {
    if (error instanceof RuntimeFailure) diagnostics.push(error.found);
    else if (error instanceof ReturnSignal) {
      // A top-level `return` is reported by the statement; nothing to do here.
    } else throw error;
  }
  return {
    output: interpreter.output,
    diagnostics,
    trace: interpreter.trace,
    steps: interpreter.steps,
    truncated: interpreter.truncated,
  };
}

/** A line of source with a caret underline, as in the notes' diagnostic sketch. */
export function excerpt(
  source: string,
  d: Diagnostic,
): { text: string; underline: string } {
  const text = (source.split("\n")[d.line - 1] ?? "").replace(/\r$/, "");
  const start = Math.max(0, d.column - 1);
  const length = Math.max(
    1,
    Math.min(d.length, Math.max(1, text.length - start)),
  );
  return { text, underline: `${" ".repeat(start)}${"^".repeat(length)}` };
}
