A <g key="lru_cache">Least Recently Used (LRU) cache</g>
reduces access time while limiting the amount of memory used
by keeping track of the N items that have been used most recently.
For example,
if the cache size is 3 and objects are accessed in the order shown in the first column,
the cache's contents will be as shown in the second column:

| Item | Action           | Cache After Access |
| ---- | ---------------- | ------------------ |
| A    | read A           | [A]                |
| A    | get A from cache | [A]                |
| B    | read B           | [B, A]             |
| A    | get A from cache | [A, B]             |
| C    | read C           | [C, A, B]          |
| D    | read D           | [D, C, A]          |
| B    | read B           | [B, D, C]          |

1.  Implement a function `cachedRead` that takes the number of entries in the cache as an argument
    and returns a function that uses an LRU cache
    to either read files or return cached copies.

2.  Modify `cachedRead` so that the number of items in the cache
    is determined by their combined size
    rather than by the number of files.
