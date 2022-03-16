{% if include.problem %}

A <span g="sparse_matrix">sparse matrix</span> is one in which most of the values are zero.
Instead of storing them all,
a program can use a map to store non-zero values
and a lookup function to return zero for anything that isn't stored explicitly:

```js
def spareMatrixGet(matrix, row, col) => {
  return matrix.contains(row, col)
    ? matrix.get(row, col)
    : 0
}
```

The same technique can be used if most of the entries in a data table are missing.
Write a function that creates a sparse table in which a random 5% of the values are non-zero
and the other 95% are zero,
then compare the memory requirements and performance of filter and select for this implementation
versus those of row-wise and column-wise storage.

{% else %}

FIXME: write solution.

{% endif %}
