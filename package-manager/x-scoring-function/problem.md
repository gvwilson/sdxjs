Many different combinations of package versions can be mutually compatible.
One way to decide which actual combination to install
is to create a <g key="scoring_function">scoring function</g>
that measures how good or bad a particular combination is.
For example,
a function could measure the "distance" between two versions as:

```js
const score (X, Y) => {
  if (X.major !== Y.major) {
    return 100 * abs(X.major - Y.major)
  } else if (X.minor !== Y.minor) {
    return 10 * abs(X.minor - Y.minor)
  } else {
    return abs(X.patch - Y.patch)
  }
}
```

1.  Implement a working version of this function
    and use it to measure the total distance between
    the set of packages found by the solver
    and the set containing the most recent version of each package.

2.  Explain why this doesn't actually solve the original problem.
