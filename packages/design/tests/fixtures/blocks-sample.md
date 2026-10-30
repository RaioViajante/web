Intro paragraph[^1].

```python title="sweep/classify.py" showLineNumbers {2-3}
a = 1
b = 2
c = 3
```

```python {2}
x = 1
y = 2
```

```python title="a.py" group="setup"
1
```

```toml title="b.toml" group="setup"
2
```

```sh terminal
$ nasm -f bin boot.asm
SeaBIOS
```

```diff title="c.py"
 keep
-old
+new
```

```text
line 0
line 1
line 2
line 3
line 4
line 5
line 6
line 7
line 8
line 9
line 10
line 11
line 12
line 13
line 14
line 15
line 16
line 17
line 18
line 19
line 20
line 21
line 22
line 23
line 24
```

```asm note="Pads with zeros."
times 510 db 0 [!1]
```

```tree
project/
├─ src/
```

:::note
A note.
:::

:::important
Important.
:::

:::warning
Warning.
:::

:::deprecated
Deprecated.
:::

:::til
Learned.
:::

:::careful
Careful.
:::

:::til[Fun fact]
Custom label.
:::

| a | b |
|---|---|
| 1 | 2 |

Second reference[^2].

[^1]: The first note.
[^2]: The second note.
