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

## How can we match query selectors?

FIXME
