Extend `count-lines-with-stat-async.js` to create a program `lh.js`
that prints two columns of output:
the number of lines in one or more files
and the number of files that are that long.
For example,
if we run:

```sh
node lh.js promises/*.*
```

::: unindented
the output might be:
:::

| Length | Number of Files |
| ------ | --------------- |
|      1 |               7 |
|      3 |               3 |
|      4 |               3 |
|      6 |               7 |
|      8 |               2 |
|     12 |               2 |
|     13 |               1 |
|     15 |               1 |
|     17 |               2 |
|     20 |               1 |
|     24 |               1 |
|     35 |               2 |
|     37 |               3 |
|     38 |               1 |
|    171 |               1 |
