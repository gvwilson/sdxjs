The simplest way to <span g="join">join</span> two tables is
to look for matching keys using a double loop.
An alternative is to build an <span g="index_database">index</span> for each table
and then use it to construct matches.
For example, suppose the tables are:

| Key | Left |
| --- | ---- |
| A   | a1   |
| B   | b1   |
| C   | c1   |

{: .continue}
and:

| Key | Right |
| --- | ----- |
| A   | a2    |
| A   | a3    |
| B   | b2    |

The first step is to create a `Map` showing where each key is found in the first table:

```js
{A: [0], B: [1], C: [2]}
```

{: .continue}
The second step is to create a similar `Map` for the second table:

```js
{A: [0, 1], B: [2]}
```

{: .continue}
We can then loop over the keys in one of the maps,
look up values in the second map,
and construct all of the matches.

Write a function that joins two tables this way.
Is it faster or slower than using a double loop?
How does the answer depend on the number of keys and the fraction that match?
