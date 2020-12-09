The function `make2D` takes a row length and one or more values
and creates a two-dimensional array from those values:

```js
make2D(2, 'a', 'b', 'c', 'd')
// produces [['a', 'b'], ['c', 'd']]
```

::: continue
Write a function that searches code to find calls to `make2D`
and replaces them with inline arrays-of-arrays.
This function only has to work for calls with a fixed row length,
i.e., it does *not* have to handle `make2D(N, 'a', 'b')`.
:::
