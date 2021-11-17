{% if include.problem %}

Write a function that reads a JavaScript source file
containing specially-formatted comments like the ones shown below
and extracts the indicated section.

```js
const toBeLeftOut = (args) => {
  console.log('this should not appear')
}

// <keepThis>
const toBeKept = (args) => {
  console.log('only this function should appear')
}
// </keepThis>
```

Users should be able to specify any tag they want,
and if that tag occurs multiple times,
all of the sections marked with that tag should be kept.
(This is the approach we took for this book instead of file interpolation.)

{% else %}

FIXME: write solution

{% endif %}
