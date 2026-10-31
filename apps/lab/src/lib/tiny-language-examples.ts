// Example programs for the tiny language playground. The code is the same in
// every locale (identifiers and string data); only the names and hints around
// it are translated, in `tiny-language-copy.ts`.

export type ExampleId =
  | "hello"
  | "arithmetic"
  | "functions"
  | "control"
  | "missing-colon"
  | "bad-indent"
  | "divide-by-zero"
  | "forever"
  | "deep-recursion";

export const examples: readonly { id: ExampleId; source: string }[] = [
  {
    id: "hello",
    source: `// Variables, strings and interpolation
let name = "Morgan"
let age: int = 27
print("Hello, {name}")
print("{name} is {age} years old")
`,
  },
  {
    id: "arithmetic",
    source: `const base = 7
let total = base * 6 - 2
print(total, total / 4, total % 4)
print(total > 30 and not (total == 41))
`,
  },
  {
    id: "functions",
    source: `fn factorial(n: int) -> int:
    if n <= 1:
        return 1
    return n * factorial(n - 1)

for i in 1..6:
    print("{i}! = {factorial(i)}")
`,
  },
  {
    id: "control",
    source: `let attempts = 0
while attempts < 5:
    attempts += 1
    if attempts % 2 == 0:
        print("{attempts} is even")
    elif attempts == 5:
        print("last one")
    else:
        print("{attempts} is odd")
`,
  },
  {
    id: "missing-colon",
    source: `fn greet(name str):
    print("Hello, {name}")

let broken = (1 +
print("this line still parses")
`,
  },
  {
    id: "bad-indent",
    source: `if true:
    print("one")
      print("two")
  print("three")
`,
  },
  {
    id: "divide-by-zero",
    source: `let items = 0
print("before")
print(10 / items)
print("never reached")
`,
  },
  {
    id: "forever",
    source: `let n = 0
while true:
    n += 1
`,
  },
  {
    id: "deep-recursion",
    source: `fn down(n: int) -> int:
    return down(n + 1)

print(down(0))
`,
  },
];
