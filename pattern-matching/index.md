---
---

-   <g key="regular_expression">Regular expressions</g> are patterns for matching text
    -   Used in everything from shell commands and text editors to web scrapers
-   Inspired pattern matching for many other kinds of data,
    like <g key="query_selector">query selectors</a> for HTML
-   Start by showing how query selectors work
-   Then show how simple regular expressions work by re-implementing a matcher
    described by [Brian Kernighan][kernighan-brian] in <cite>Oram2007</cite>
-   Then show part of a more general approach to matching

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

<%- include('/_inc/file.html', {file: 'simple-selectors.js'}) %>

-   `firstMatch` tries to match the first remaining selector
    -   Either this node or one of its children
-   `firstChildMatch` looks through children (if any) for remaining selectors
-   `matchHere` handles a single node and selector

<%- include('/_inc/multi.html', {pat: 'simple-selectors-test.*', fill: 'js txt'}) %>

## How can we implement a simple regular expression matcher?

-   Our matcher will initially handle just five cases:

| Character | Meaning |
| --------- | ------- |
| *c*       | Any literal character *c* |
| .         | Any single character |
| ^         | Beginning of input |
| $         | End of input |
| *         | Zero or more of the previous character |

It's small,
but as Kernighan said,
"This is quite a useful class;
in my own experience of using regular expressions on a day-to-day basis,
it easily accounts for 95 percent of all instances."

-   Regular expression matching

<%- include('/_inc/erase.html', {file: 'simple-regex.js', tag: 'tests'}) %>

-   Some tests and output

<%- include('/_inc/slice.html', {file: 'simple-regex.js', tag: 'tests'}) %>
<%- include('/_inc/file.html', {file: 'simple-regex.txt'}) %>

-   This works, but it's hard to extend
    -   Handling parentheses in patterns like `/a(bc)*d/` requires big changes

## How can we implement an extensible matcher?

-   Implement each kind of match as an object
    -   Object rather than function because it has extra information like "what character do I match?"
    -   Input is text and index to start matching at
    -   Output is index to continue matching at *or* `undefined` indicating that matching failed
-   Combine these objects to create a matcher
    -   And then write something to translate text expressions into collections of matchers
    -   Or just stick with code
-   First step is to define test cases
    -   Which also forces us to define our syntax

<%- include('/_inc/file.html', {file: 'regex-initial/regex-complete.js'}) %>

-   Each matcher is a function that returns a matching object
    -   Saves us having to type `new` all over the place
-   Create a <g key="base_class">base class</g> that all matchers will inherit from
    -   Defines the `match` method that users will call
    -   So that no matter what kind of matcher we have at the top level, we can start matching
-   Creates a "match here" method that throws an error
    -   So that if we forget to provide `_match` in a <g key="derived_class">derived class</g>
        our code will fail with a meaningful reminder

<%- include('/_inc/file.html', {file: 'regex-initial/regex-base.js'}) %>

-   Define empty versions of each class like this to get started

<%- include('/_inc/file.html', {file: 'regex-initial/regex-lit.js'}) %>

-   Our tests now run, but most of them fail
    -   "Most" because if we expect a match to fail, it does, so the test runner reports `true`
    -   Tells us how much work we have to do

<%- include('/_inc/file.html', {file: 'regex-initial.txt'}) %>

-   Start by implementing literal character string matcher

<%- include('/_inc/file.html', {file: 'regex-beginning/regex-lit.js'}) %>

-   Some tests now pass, others still fail (as expected)

<%- include('/_inc/file.html', {file: 'regex-beginning.txt'}) %>

-   Do `RegexSeq` next so that we can combine other tests
    -   This is why we have tests for `Seq(Lit('a'), Lit('b'))` and `Lit('ab')`
    -   All children have to match in order without gaps
-   But wait a moment
    -   Suppose we have the pattern `/a*ab/`
    -   This ought to match the text `"ab"`, but will it?
    -   The `*` is <g key="greedy_algorithm">greedy</g>: it matches as much as it can
    -   So `/a*/` will match the leading `"a"`, leaving nothing for the literal `/a/` to match
    -   Our current implementation doesn't give us a way to try alternatives
-   Re-think
    -   Each matcher takes its own arguments and a `rest` parameter which is the rest of the matchers
    -   Provide `null` as a default in the creation function so we don't have to type it over and over again
    -   Try each of its possibilities and then see if the rest will also match
    -   Means we can get rid of `RegexSeq`
-   Tests are a little harder to read

<%- include('/_inc/file.html', {file: 'regex-recursive/regex-complete.js'}) %>

-   Match a literal expression
    -   Does all of the pattern match in the given text starting at this point?
    -   If so, does the rest of the overall pattern match?

<%- include('/_inc/file.html', {file: 'regex-recursive/regex-lit.js'}) %>

-   Matching the start `/^/` and end `/$/` anchors is just as straightforward

<%- include('/_inc/file.html', {file: 'regex-recursive/regex-start.js'}) %>

<%- include('/_inc/file.html', {file: 'regex-recursive/regex-end.js'}) %>

-   Matching either/or is a matter of trying a pattern and the rest until one matches,
    and failing if neither does

<%- include('/_inc/file.html', {file: 'regex-recursive/regex-alt.js'}) %>

-   Matching repetition is easy *if* we're willing to be inefficient
    -   Try zero matches, then one, then two, and so on until something succeeds
    -   Which means we are repeatedly re-matching things we already know work

::: fixme
diagram showing repetition in regex
:::

-   We also need to figure out how long to keep trying
    -   Each non-empty repetition matches at least one character
    -   So the number of remaining characters is the maximum number of matches we have to try

<%- include('/_inc/file.html', {file: 'regex-recursive/regex-any.js'}) %>

-   The main point here is how extensible this approach is
-   That extensibility comes from the lack of centralized decision-making
    -   The <g key="chain_of_responsibility_pattern">Chain of Responsibility</g> design pattern
    -   "Do my part and ask something else to handle the rest"

<%- include('/_inc/problems.html') %>
