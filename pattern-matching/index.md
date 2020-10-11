---
---

-   <g key="regular_expression">Regular expressions</g> are patterns for matching text
    -   Used in everything from shell commands and text editors to web scrapers
-   Inspired pattern matching for many other kinds of data
    -   Like <g key="query_selector">query selectors</a> for HTML
-   We will show how regular expressions work by re-implementing a simple matcher
    described by [Brian Kernighan][kernighan-brian] in <cite>Oram2007</cite>
-   Then go on to pattern-matching

## How can we implement a simple matcher?

-   Our matcher will initially handle just five cases:

| Character | Meaning |
| --------- | ------- |
| *c*       | Any literal character *c* |
| .         | Any single character |
| ^         | Beginning of input |
| $         | End of input |
| *         | Zero or more of the previous character |

As Kernighan said,
"This is quite a useful class;
in my own experience of using regular expressions on a day-to-day basis,
it easily accounts for 95 percent of all instances."

<%- include('/inc/multi.html', {pat: 'simple-regex.*', fill: 'js txt'}) %>

## How can we match query selectors?

-   First step is to define the grammar we want to support

| Selector | Meaning |
| -------- | ------- |
| `elt`    | Element with tag `"elt"` |
| `.cls`   | Element with `class="cls"` |
| `#ident`   | Element with `id="ident"` |
| `parent child` | `child` element inside a `parent` element |

-   So `blockquote#important p.highlight` is a highlighted paragraph inside the blockquote whose ID is `"important"`
-   To find the first match:
    -   Break the query string into pieces
    -   Recurse down the tree until the query string is exhausted or no matches found
    -   A <g key="depth_first_search">depth-first search</g>

<%- include('/inc/code.html', {file: 'simple-selectors.js'}) %>

-   `firstMatch` tries to match the first remaining selector
    -   Either this node or one of its children
-   `firstChildMatch` looks through children (if any) for remaining selectors
-   `matchHere` handles a single node and selector

<%- include('/inc/multi.html', {pat: 'simple-selectors-test.*', fill: 'js txt'}) %>

<%- include('/inc/problems.html') %>
