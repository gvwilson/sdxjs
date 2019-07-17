Derive a class from `Walker`
that reports how deep each top-level expression in the source code is.
For example,
the depth of `1 + 2 * 3` is 2,
while the depth of `max(1 + 2 + 3)` is 3
(one level for the function call,
one for the first addition,
and one for the nested addition).
