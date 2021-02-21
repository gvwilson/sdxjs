---
---

We have been globbing to match filenames against patterns since <x key="systems-programming"></x>.
This lesson will explore how that works
by building a simple version of the <g key="regular_expression">regular expressions</g>
used to match text in everything from editor and shell commands to web scrapers.
Our approach is inspired by [Brian Kernighan][kernighan-brian]'s entry in <cite>Oram2007</cite>.

Regular expressions have inspired pattern matching for many other kinds of data,
such as <g key="query_selector">query selectors</g> for HTML.
They are easier to understand and implement than patterns for matching text,
so we will start by looking at them.

## How can we match query selectors?

Programs stores HTML pages in memory using a <g key="dom">document object model</g> or DOM.
Each element in the page,
such as a heading and or paragraph,
is a <g key="node">nodes</g>;
the <g key="child_tree">children</g> of a node are the elements it contains
(<f key="pattern-matching-dom-tree"></f>).

<%- include('/inc/figure.html', {
    id: 'pattern-matching-dom-tree',
    img: './figures/dom-tree.svg',
    alt: 'The Document Object Model',
    cap: 'Representing an HTML document as a tree.'
}) %>

The first step is to define the patterns we want to support
(<t key="pattern-matching-supported"></t>).

<%- include('/inc/table.html', {
    id: 'pattern-matching-supported',
    file: 'supported.tbl',
    cap: 'Supported patterns.'
}) %>

According to this grammar,
`blockquote#important p.highlight` is a highlighted paragraph inside the blockquote whose ID is `"important"`.
To find elements in a page that match it,
our `select` function breaks the query into pieces
and uses `firstMatch` to search recursively down the document tree
until all the selectors in the query string have matched or no matches have been found
(<f key="pattern-matching-query-selectors"></f>).

<%- include('/inc/figure.html', {
    id: 'pattern-matching-query-selectors',
    img: './figures/query-selectors.svg',
    alt: 'Matching query selectors',
    cap: 'Matching a simple set of query selectors.'
}) %>

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

1.  This node *doesn't* match the current selector,
    so we search the children one by one to see if there is a match further down.

This algorithm is called <g key="depth_first_search">depth-first search</g>:
it explores one possible match to the end before considering any others.
`firstMatch` relies on a helper function called `firstChildMatch`,
which finds the first child of a node to match a set of selectors:

<%- include('/inc/keep.html', {file: 'simple-selectors.js', key: 'firstChild'}) %>

::: continue
and on the function `matchHere` which compares a node against a selector:
:::

<%- include('/inc/keep.html', {file: 'simple-selectors.js', key: 'matchHere'}) %>

This version of `matchHere` is simple but inefficient,
since it breaks the selector into parts each time it is called
rather than doing that once and re-using the results.
We will build a more efficient version in the exercises,
but let's try out the one we have.
Our test cases are all in one piece of HTML:

<%- include('/inc/keep.html', {file: 'simple-selectors-test.js', key: 'tests'}) %>

The program contains a table of queries and the expected matches.
The function `main` loops over it to report whether each test passes or fails:

<%- include('/inc/keep.html', {file: 'simple-selectors-test.js', key: 'main'}) %>

::: continue
`main` uses a helper function called `getText` to extract text from a node
or return an error message if something has gone wrong:
:::

<%- include('/inc/keep.html', {file: 'simple-selectors-test.js', key: 'getText'}) %>

When we run our program it produces this result:

<%- include('/inc/file.html', {file: 'simple-selectors-test.out'}) %>

We will rewrite these tests using [Mocha][mocha] in the exercises.

::: callout
### Test then build

We actually wrote our test cases *before* implementing the code to match query selectors
in order to give ourselves a goal to work toward.
Doing this is called <g key="tdd">test-driven development</g>, or TDD;
while research doesn't support the claim that
it makes programmers more productive <cite>Fucci2016,Fucci2017</cite>,
we find it helps prevent <g key="scope_creep">scope creep</g> when writing lessons.
:::

## How can we implement a simple regular expression matcher?

Matching regular expressions against text relies on the same recursive strategy
as matching query selectors against nodes in an HTML page.
If the first element of the pattern matches where we are,
we see if the rest of the pattern matches what's left;
otherwise,
we see if the the pattern will match further along.
Our matcher will initially handle just the five cases shown in
<t key="pattern-matching-cases"></t>.

<%- include('/inc/table.html', {
    id: 'pattern-matching-cases',
    file: 'cases.tbl',
    cap: 'Pattern matching cases.'
}) %>

::: continue
These five cases are a small subset of what JavaScript provides,
but as Kernighan wrote,
"This is quite a useful class;
in my own experience of using regular expressions on a day-to-day basis,
it easily accounts for 95 percent of all instances."
:::

The top-level function that users call
handles the special case of `^` at the start of a pattern
matching the start of the target string being searched.
It then tries the pattern against each successive substring of the target string
until it finds a match or runs out of characters:

<%- include('/inc/keep.html', {file: 'simple-regex.js', key: 'match'}) %>

`matchHere` does the matching and recursing:

<%- include('/inc/keep.html', {file: 'simple-regex.js', key: 'matchHere'}) %>

Once again,
we use a table of test cases and expected results to test it:

<%- include('/inc/keep.html', {file: 'simple-regex.js', key: 'tests'}) %>
<%- include('/inc/file.html', {file: 'simple-regex.out'}) %>

This program seems to work,
but it actually contains an error that we will correct in the exercises.
(Think about what happens if we match the pattern `/a*ab/` against the string `'aab'`.)
Our design is also hard to extend:
handling parentheses in patterns like `/a(bc)*d/` will require major changes.
We need to explore a different approach.

## How can we implement an extensible matcher?

Instead of packing all of our code into one long function,
we can implement each kind of match as separate function.
Doing this makes it much easier to add more matchers:
we just define a function that we can mix in with calls to the ones we already have.

Rather than having these functions do the matching immediately,
though,
we will have each one return an object that knows how to match itself against some text.
Doing this allows us to build a complex match once and re-use it many times.
This is a common pattern in text processing:
we may want to apply a regular expression to each line in a large set of files,
so recycling the matchers will make our programs more efficient.

Each matching object has a method that takes the target string and the index to start matching at as inputs.
Its output is the index to continue matching at
or `undefined` indicating that matching failed.
We can then combine these objects to match complex patterns
(<f key="pattern-matching-regex-objects"></f>).

<%- include('/inc/figure.html', {
    id: 'pattern-matching-regex-objects',
    img: './figures/regex-objects.svg',
    alt: 'Implementing regex with objects',
    cap: 'Using nested objects to match regular expressions.'
}) %>

The first step in implementing this is is to write test cases,
which forces us to define the syntax we are going to support:

<%- include('/inc/file.html', {file: 'regex-initial/regex-complete.js'}) %>

Next,
we define a <g key="base_class">base class</g> that all matchers will inherit from.
This class contains the `match` method that users will call
so that we can start matching right away
no matter what kind of matcher we have at the top level of our pattern.

<%- include('/inc/file.html', {file: 'regex-initial/regex-base.js'}) %>

::: continue
The base class also defines a `_match` method (with a leading underscore)
that other classes will fill in with actual matching code.
The base implementation of this method throws an exception
so that if we forget to provide `_match` in a <g key="derived_class">derived class</g>
our code will fail with a meaningful reminder.
:::

::: callout
### One interface to call them all

Our design makes use of <g key="polymorphism">polymorphism</g>,
which literally means "having multiple forms".
If a set of objects all have methods that can be called the same way,
then those objects can be used interchangeably.
Putting it another way,
a program can use them without knowing exactly what they are.
Polymorphism is what enables different USB devices to plug into the same socket
and why drawing programs can select and move arbitrary shapes.
:::

We can now define empty versions of each matching class that all say "no match here"
like this one for literal characters:

<%- include('/inc/file.html', {file: 'regex-initial/regex-lit.js'}) %>

::: continue
Our tests now run, but most of them fail:
"most" because we expect some tests not to match,
so the test runner reports `true`.
:::

<%- include('/inc/file.html', {file: 'regex-initial.out'}) %>

::: continue
This output tells us how much work we have left to do:
when all of these tests pass,
we're finished.
:::

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
`/a*/` will match the leading `"a"`, leaving nothing for the literal `/a/` to match
(<f key="pattern-matching-greedy-failure"></f>).
Our current implementation doesn't give us a way to try other possible matches when this happens.

<%- include('/inc/figure.html', {
    id: 'pattern-matching-greedy-failure',
    img: './figures/greedy-failure.svg',
    alt: 'Overly-greedy matching fails',
    cap: "Why overly-greedy matching doesn't work."
}) %>

Let's re-think our design
and have each matcher take its own arguments and a `rest` parameter containing the rest of the matchers
(<f key="pattern-matching-rest"></f>).
(We will provide a default of `null` in the creation function
so we don't have to type `null` over and over again.)
Each matcher will try each of its possibilities and then see if the rest will also match.

<%- include('/inc/figure.html', {
    id: 'pattern-matching-rest',
    img: './figures/rest.svg',
    alt: 'Matching the rest of the pattern',
    cap: 'Using "rest" to match the remainder of a pattern.'
}) %>

This design means we can get rid of `RegexSeq`,
but it does make our tests a little harder to read:

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

To match a repetition,
we figure out the maximum number of matches that might be left,
then count down until something succeeds.
(We start with the maximum because matching is supposed to be greedy.)
Each non-empty repetition matches at least one character,
so the number of remaining characters is the maximum number of matches worth trying.

<%- include('/inc/file.html', {file: 'regex-recursive/regex-any.js'}) %>

With these classes in place,
our tests all pass:

<%- include('/inc/file.html', {file: 'regex-recursive.out'}) %>

The most important thing about this design is how extensible it is:
if we want to add other kinds of matching,
all we have to do is add more classes.
That extensibility comes from the lack of centralized decision-making,
which in turn comes from our use of polymorphism
and the <g key="chain_of_responsibility_pattern">Chain of Responsibility</g> design pattern.
Each component does its part and asks something else to handle the remaining work;
so long as each component takes the same inputs,
we can put them together however we want.

::: callout
### The Open-Closed Principle

The <g key="open_closed_principle">open-closed principle</g> states that
software should be open for extension but closed for modification,
i.e., that it should be possible to extend functionality
without having to rewrite existing code.
As we said in <x key="async-programming"></x>,
this allows old code to use new code,
but only if our design permits the kinds of extensions people are going to want to make.
Since we can't anticipate everything,
it is normal to have to revise a design the first two or three times we try to extend it.
As <cite>Brand1995</cite> said of buildings,
the things we make learn how to do things better as we use them.
:::