---
---

We have been <g key="globbing">globbing</g> to match filenames against patterns since <x key="systems-programming"></x>.
This lesson will explore how that works
by building a simple version of <g key="regular_expression">regular expressions</g>,
which are patterns for matching text
used in everything from shell commands and text editors to web scrapers.
Our approach is inspired by [Brian Kernighan][kernighan-brian]'s entry in <cite>Oram2007</cite>.

## How can we match query selectors?

Regular expressions have inspired pattern matching for many other kinds of data,
such as <g key="query_selector">query selectors</g> for HTML.
They are easier to understand and implement,
so we will start by looking at them.
The first step is to define the patterns we want to support:

| Meaning | Selector |
| ------- | -------- |
| Element with tag `"elt"` | `elt`    |
| Element with `class="cls"` | `.cls`   |
| Element with `id="ident"` | `#ident`   |
| `child` element inside a `parent` element | `parent child` |

<%- include('/inc/fig.html', {
    id: 'pattern-matching-query-selectors',
    img: '/static/tools-small.jpg',
    alt: 'Query selectors',
    cap: 'A simple set of query selectors.',
    fixme: true
}) %>

According to this grammar,
`blockquote#important p.highlight` is a highlighted paragraph inside the blockquote whose ID is `"important"`.
To find elements in a page that match it,
our `select` function breaks the query into pieces
and then calls `firstMatch` to recurse down the document tree
until the query string is exhausted or no matches have been found.

<%- include('/inc/erase.html', {file: 'simple-selectors.js', key: 'skip'}) %>

The `firstMatch` function handles three cases:

1.  This node isn't an element, i.e., it is plain text or a comment.
    This can't match a selector, and these nodes don't have children,
    so the function returns `null` to indicate that matching has failed.

1.  This node matches the current selector.
    If there aren't any selectors left then the whole pattern must have matched,
    so the function returns this node as the match.
    If there *are* more selectors,
    we try to match those that remain against this node's children
    and return whatever result that produces.

1.  If this node doesn't match the current selector
    then we search the children one by one to see if there is a match further down.

This algorithm is called <g key="depth_first_search">depth-first search</g>:
it explores one possible match to the end before considering any others.
It relies on a helper function called `firstChildMatch`,
which finds the first child of a node to match a set of selectors:

<%- include('/inc/keep.html', {file: 'simple-selectors.js', key: 'firstChild'}) %>

::: continue
and on the function `matchHere` which compares a node against a selector:
:::

<%- include('/inc/keep.html', {file: 'simple-selectors.js', key: 'matchHere'}) %>

This version of `matchHere` is simple but inefficient,
since it breaks the selector into parts each time it's called
rather than doing that once and re-using the results.
We will build a more efficient version in the exercises.

Let's try it out.
Our test cases are all in one piece of HTML:

<%- include('/inc/keep.html', {file: 'simple-selectors-test.js', key: 'tests'}) %>

The main program contains a table of queries and the expected matches,
and loops over it to report whether each test passes or fails:

<%- include('/inc/keep.html', {file: 'simple-selectors-test.js', key: 'main'}) %>

::: continue
It uses a helper function called `getText` to extract text from a node
or return an error message if something has gone wrong:
:::

<%- include('/inc/keep.html', {file: 'simple-selectors-test.js', key: 'getText'}) %>

When we run it, it produces this result:

<%- include('/inc/file.html', {file: 'simple-selectors-test.out'}) %>

<%- include('/inc/fig.html', {
    id: 'pattern-matching-query-selectors-travesal',
    img: '/static/tools-small.jpg',
    alt: 'Matching query selectors',
    cap: 'Recursing through a tree to match query selectors.',
    fixme: true
}) %>

We will rewrite these tests using [Mocha][mocha] in the exercises.

## How can we implement a simple regular expression matcher?

Matching regular expressions against text relies on the same recursive strategy
as matching query selectors against nodes in an HTML page:
if the first element of the pattern matches where we are,
then see if the rest of the pattern matches what's left.
Otherwise,
see if the whole (remaining) pattern will match further along.
Our matcher will initially handle just five cases:

| Meaning | Character |
| ------- | --------- |
| Any literal character *c* | *c* |
| Any single character | . |
| Beginning of input | ^ |
| End of input | $ |
| Zero or more of the previous character | * |

::: continue
This is small,
but as Kernighan wrote,
"This is quite a useful class;
in my own experience of using regular expressions on a day-to-day basis,
it easily accounts for 95 percent of all instances."
:::

The top-level function that users actually call
handles the special case of `^` at the start of a pattern
matching the start of the target string being searched.
It then tries the pattern against each successive substring of the target string
until it finds a match or runs out of characters:

<%- include('/inc/keep.html', {file: 'simple-regex.js', key: 'match'}) %>

`matchHere` does the matching and recursing:

<%- include('/inc/keep.html', {file: 'simple-regex.js', key: 'matchHere'}) %>

Once again,
we use a table of inputs and expected results to test it:

<%- include('/inc/keep.html', {file: 'simple-regex.js', key: 'tests'}) %>
<%- include('/inc/file.html', {file: 'simple-regex.out'}) %>

This seems to work,
but contains an error that we will correct in the exercises.
(Think about what happens if we match the pattern `/a*ab/` against the string `'aab'`.)
It's also going to be hard to extend:
handling parentheses in patterns like `/a(bc)*d/` will require major changes.
We need to explore a different design.

## How can we implement an extensible matcher?

Instead of packing all of our code into one long function,
we can implement each kind of match as an object---an object rather than function
because some matchers need extra information like the character that they match.
Each matcher has a method that takes the target string and the index to start matching at as inputs.
Its output is the index to continue matching at
*or* `undefined` indicating that matching failed.
We can then combine these objects to create a matcher;
we'll do that manually in this chapter
and automate the process in <x key="regex-parser"></x>.

<%- include('/inc/fig.html', {
    id: 'pattern-matching-regex-objects',
    img: '/static/tools-small.jpg',
    alt: 'Implementing regex with objects',
    cap: 'Using nested objects to match regular expressions.',
    fixme: true
}) %>

The first step in implementing this is is to write test cases,
which forces us to define the syntax we are going to support:

<%- include('/inc/file.html', {file: 'regex-initial/regex-complete.js'}) %>

::: callout
### Test, then code

Writing tests cases before writing application code is called
<g key="tdd">test-driven development</g>, or TDD;
research doesn't support claims that it makes programmers more productive <cite>Fucci2016,Fucci2017</cite>,
but it helps give direction to this chapter.
:::

Each matcher is a function that returns a matching object,
which saves us having to type `new` all over the place.
We define a <g key="base_class">base class</g> that all matchers will inherit from,
which contans the `match` method that users will call.
This design ensures that no matter what kind of matcher we have at the top level,
we can start matching right away.

<%- include('/inc/file.html', {file: 'regex-initial/regex-base.js'}) %>

::: continue
The base class also defines a `_match` method (with a leading underscore)
that other classes will fill in with actual matching code.
The base implementation of this method throws an exception
so that if we forget to provide `_match` in a <g key="derived_class">derived class</g>
our code will fail with a meaningful reminder.

We can now define empty versions of each matching class that all say "no match here"
like this one for literal characters:

<%- include('/inc/file.html', {file: 'regex-initial/regex-lit.js'}) %>

::: continue
Our tests now run, but most of them fail:
"most" because if we expect a match to fail, it does, so the test runner reports `true`.
:::

<%- include('/inc/file.html', {file: 'regex-initial.out'}) %>

This output tells us how much work we have left to do:
when all of these tests pass,
we're finished.
Let's implement a literal character string matcher first:

<%- include('/inc/file.html', {file: 'regex-beginning/regex-lit.js'}) %>

Some tests now pass, others still fail as expected:

<%- include('/inc/file.html', {file: 'regex-beginning.out'}) %>

We will tackle `RegexSeq` next so that we can combine other matchers.
This is why we have tests for `Seq(Lit('a'), Lit('b'))` and `Lit('ab')`:
all children have to match in order without gaps.

But wait:
suppose we have the pattern `/a*ab/`.
This ought to match the text `"ab"`, but will it?
The `/*/` is <g key="greedy_algorithm">greedy</g>: it matches as much as it can.
As a result,
`/a*/` will match the leading `"a"`, leaving nothing for the literal `/a/` to match.
Our current implementation doesn't give us a way to try other possible matches when this happens.

<%- include('/inc/fig.html', {
    id: 'pattern-matching-greedy-failure',
    img: '/static/tools-small.jpg',
    alt: 'Overly-greedy matching fails',
    cap: "Why overly-greedy matching doesn't work.",
    fixme: true
}) %>

Let's re-think our design
and have each matcher take its own arguments and a `rest` parameter containing the rest of the matchers.
(We will provide a default of `null` in the creation function
so we don't have to type `null` over and over again.)
The matcher will try each of its possibilities and then see if the rest will also match.

<%- include('/inc/fig.html', {
    id: 'pattern-matching-rest',
    img: '/static/tools-small.jpg',
    alt: 'Matching the rest of the pattern',
    cap: 'Using "rest" to match the remainder of a pattern.',
    fixme: true
}) %>

As a beneficial side effect,
this design means we can get rid of `RegexSeq`.
On the other hand,
our tests are a little harder to read:

<%- include('/inc/file.html', {file: 'regex-recursive/regex-complete.js'}) %>

Here's how this works for matching a literal expression:

<%- include('/inc/file.html', {file: 'regex-recursive/regex-lit.js'}) %>

::: continue
The `_match` method checks whether all of the pattern matches the target text starting at the current location.
If so, it checks whether the rest of the overall pattern matches what's left.
Matching the start `/^/` and end `/$/` anchors is just as straightforward:
:::

<%- include('/inc/file.html', {file: 'regex-recursive/regex-start.js'}) %>

<%- include('/inc/file.html', {file: 'regex-recursive/regex-end.js'}) %>

Matching either/or is done by trying the first pattern and the rest,
and if that fails,
trying the second pattern and the rest:

<%- include('/inc/file.html', {file: 'regex-recursive/regex-alt.js'}) %>

Matching repetition is easy but inefficient:
we try zero matches, then one, then two, and so on until something succeeds,
which means we are repeatedly re-matching things we already know work.

<%- include('/inc/fig.html', {
    id: 'pattern-matching-repetition',
    img: '/static/tools-small.jpg',
    alt: 'Repetition in regular expressions',
    cap: 'Matching repeated patterns in regular expressions.',
    fixme: true
}) %>

We also need to figure out how long to keep trying:
each non-empty repetition matches at least one character,
so the number of remaining characters is the maximum number of matches we have to try.

<%- include('/inc/file.html', {file: 'regex-recursive/regex-any.js'}) %>

With these classes in place,
our tests all pass:

<%- include('/inc/file.html', {file: 'regex-recursive.out'}) %>

The most important thing about this design is how extensible it is:
if we want to add other kinds of matching,
all we have to do is add more classes.
That extensibility comes from the lack of centralized decision-making,
which in turn comes from our use of the <g key="chain_of_responsibility_pattern">Chain of Responsibility</g> design pattern.
Each component is designed to do its part and ask something else to handle the remaining work;
so long as each component takes the same inputs,
they can be put together any way we want.
