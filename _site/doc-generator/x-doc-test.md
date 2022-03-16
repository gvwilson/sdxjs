{% if include.problem %}

The [doctest][doctest] library for Python
allows programmers to embed unit tests as documentation in their programs.
Write a tool that:

1.  Finds functions that start with a block comment.

2.  Extracts the code and output from those blocks comments
    and turns them into assertions.

{: .continue}
For example, given this input:

```js
const findIncreasing = (values) => {
  /**
   * > findIncreasing([])
   * []
   * > findIncreasing([1])
   * [1]
   * > findIncreasing([1, 2])
   * [1, 2]
   * > findIncreasing([2, 1])
   * [2]
   */
}
```

{: .continue}
the tool would produce:

```js
assert.deepStrictEqual(findIncreasing([]), [])
assert.deepStrictEqual(findIncreasing([1]), [1])
assert.deepStrictEqual(findIncreasing([1, 2]), [1, 2])
assert.deepStrictEqual(findIncreasing([2, 1]), [2])
```

{% else %}

FIXME: write solution

{% endif %}
