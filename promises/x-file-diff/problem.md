Using `async` and `await`,
write a program called `file-diff.js`
that compares the lines in two files
and shows which ones are only in the first file,
which are only in the second,
and which are in both.
For example,
if `left.txt` contains:

```txt
some
people
```

::: continue
and `right.txt` contains:
:::

```txt
write
some
code
```

::: continue
then:
:::

```sh
node file-diff.js left.txt right.txt
```

::: continue
would print:
:::

```txt
2 code
1 people
* some
2 write
```

::: continue
where `1`, `2`, and `*` show whether lines are in only the first or second file
or are in both.
Note that the order of the lines in the file doesn't matter.
:::

::: hint
You may want to use the `Set` class to store lines.
:::
