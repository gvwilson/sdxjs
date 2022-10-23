---
title: "Pattern Matching"
---

We have been globbing to match filenames against patterns since [%x systems-programming %].
This lesson will explore how that works
by building a simple version of the [%i "regular expression" %][%g regular_expression "regular expressions" %][%/i%]
used to match text in everything from editor and shell commands to web scrapers.
Our approach is inspired by [%i "Kernighan, Brian" %][Brian Kernighan's][kernighan_brian][%/i%] entry
in [%b Oram2007 %].

Regular expressions have inspired pattern matching for many other kinds of data,
such as [%i "query selector (for HTML)" %][%g query_selector "query selectors" %][%/i%] for HTML.
They are easier to understand and implement than patterns for matching text,
so we will start by looking at them.

## How can we match query selectors? {: #pattern-matching-selectors}

Programs stores HTML pages in memory using a [%i "DOM" "Document Object Model" %][%g dom "document object model" %][%/i%] or DOM.
Each element in the page,
such as a heading and or paragraph,
is a [%i "node" %][%g node "node" %][%/i%];
the [%g child_tree "children" %] of a node are the elements it contains
([%f pattern-matching-dom-tree %]).

[% figure
   slug="pattern-matching-dom-tree"
   img="dom-tree.svg"
   alt="The Document Object Model"
   caption="Representing an HTML document as a tree."
%]

The first step is to define the patterns we want to support
([%t pattern-matching-supported %]).
According to this grammar,
`blockquote#important p.highlight` is a highlighted paragraph inside the blockquote whose ID is `"important"`.
To find elements in a page that match it,
our `select` function breaks the query into pieces
and uses `firstMatch` to search recursively down the document tree
until all the selectors in the query string have matched or no matches have been found
([%f pattern-matching-query-selectors %]).

<div class="table" id="pattern-matching-supported" caption="Supported patterns." markdown="1">
| Meaning | Selector |
| ------- | -------- |
| Element with tag `"elt"` | `elt`    |
| Element with `class="cls"` | `.cls`   |
| Element with `id="ident"` | `#ident`   |
| `child` element inside a `parent` element | `parent child` |
</div>

[% figure
   slug="pattern-matching-query-selectors"
   img="query-selectors.svg"
   alt="Matching query selectors"
   caption="Matching a simple set of query selectors."
%]

[% inc file="simple-selectors.js" omit="skip" %]

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

This algorithm is called [%i "depth-first search" "search!depth-first" %][%g depth_first "depth-first search" %][%/i%]:
it explores one possible match to the end before considering any others.
`firstMatch` relies on a helper function called `firstChildMatch`,
which finds the first child of a node to match a set of selectors:

[% inc file="simple-selectors.js" keep="firstChild" %]

and on the function `matchHere` which compares a node against a selector:
{: .continue}

[% inc file="simple-selectors.js" keep="matchHere" %]

This version of `matchHere` is simple but inefficient,
since it breaks the selector into parts each time it is called
rather than doing that once and re-using the results.
We will build a more efficient version in the exercises,
but let's try out the one we have.
Our test cases are all in one piece of HTML:

[% inc file="simple-selectors-test.js" keep="tests" %]

The program contains a table of queries and the expected matches.
The function `main` loops over it to report whether each test passes or fails:

[% inc file="simple-selectors-test.js" keep="main" %]

`main` uses a helper function called `getText` to extract text from a node
or return an error message if something has gone wrong:
{: .continue}

[% inc file="simple-selectors-test.js" keep="getText" %]

<div class="pagebreak"></div>

When we run our program it produces this result:

[% inc file="simple-selectors-test.out" %]

We will rewrite these tests using [%i "Mocha" %][Mocha][mocha][%/i%] in the exercises.

<div class="callout" markdown="1">

### Test then build

We actually wrote our test cases *before* implementing the code to match query selectors
in order to give ourselves a goal to work toward.
Doing this is called [%i "test-driven development" "TDD" %][%g tdd "test-driven development" %][%/i%], or TDD;
while research doesn't support the claim that
it makes programmers more productive [%b Fucci2016 Fucci2017 %],
we find it helps prevent [%i "scope creep!when writing lessons" %][%g scope_creep "scope creep" %][%/i%] when writing lessons.

</div>

## How can we implement a simple regular expression matcher? {: #pattern-matching-re}

Matching regular expressions against text relies on the same recursive strategy
as matching query selectors against nodes in an HTML page.
If the first element of the pattern matches where we are,
we see if the rest of the pattern matches what's left;
otherwise,
we see if the the pattern will match further along.
Our matcher will initially handle just the five cases shown in
[%t pattern-matching-cases %].
These cases are a small subset of what JavaScript provides,
but as [%i "Kernighan, Brian" %]Kernighan[%/i%] wrote,
"This is quite a useful class;
in my own experience of using regular expressions on a day-to-day basis,
it easily accounts for 95 percent of all instances."

<div class="table table-here" id="pattern-matching-cases" caption="Pattern matching cases." markdown="1">
| Meaning | Character |
| ------- | --------- |
| Any literal character *c* | *c* |
| Any single character | . |
| Beginning of input | ^ |
| End of input | $ |
| Zero or more of the previous character | * |
</div>

The top-level function that users call
handles the special case of `^` at the start of a pattern
matching the start of the target string being searched.
It then tries the pattern against each successive substring of the target string
until it finds a match or runs out of characters:

[% inc file="simple-regex.js" keep="match" %]

`matchHere` does the matching and recursing:

[% inc file="simple-regex.js" keep="matchHere" %]

Once again,
we use a table of test cases and expected results to test it:

[% inc file="simple-regex.js" keep="tests" %]
[% inc file="simple-regex.out" %]

This program seems to work,
but it actually contains an error that we will correct in the exercises.
(Think about what happens if we match the pattern `/a*ab/` against the string `'aab'`.)
Our design is also hard to extend:
handling parentheses in patterns like `/a(bc)*d/` will require major changes.
We need to explore a different approach.

## How can we implement an extensible matcher? {: #pattern-matching-extensible}

Instead of packing all of our code into one long function,
we can implement each kind of match as a separate function.
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
([%f pattern-matching-regex-objects %]).

[% figure
   slug="pattern-matching-regex-objects"
   img="regex-objects.svg"
   alt="Implementing regex with objects"
   caption="Using nested objects to match regular expressions."
%]

The first step in implementing this is to write test cases,
which forces us to define the syntax we are going to support:

[% inc file="regex-initial/regex-complete.js" %]

<div class="pagebreak"></div>

Next,
we define a [%g base_class "base class" %] that all matchers will inherit from.
This class contains the `match` method that users will call
so that we can start matching right away
no matter what kind of matcher we have at the top level of our pattern.

[% inc file="regex-initial/regex-base.js" %]

The base class also defines a `_match` method (with a leading underscore)
that other classes will fill in with actual matching code.
The base implementation of this method throws an exception
so that if we forget to provide `_match` in a [%g derived_class "derived class" %]
our code will fail with a meaningful reminder.
{: .continue}

<div class="callout" markdown="1">

### One interface to call them all

Our design makes use of [%i "polymorphism (in software design)" "software design!polymorphism" %][%g polymorphism "polymorphism" %][%/i%],
which literally means "having multiple forms".
If a set of objects all have methods that can be called the same way,
then those objects can be used interchangeably;
putting it another way,
a program can use them without knowing exactly what they are.
Polymorphism reduces the [%i "coupling" "software design!coupling" %][%g coupling "coupling" %][%/i%] between different parts of our program,
which in turn makes it easier for those programs to evolve.

</div>

We can now define empty versions of each matching class that all say "no match here"
like this one for literal characters:

[% inc file="regex-initial/regex-lit.js" %]

Our tests now run, but most of them fail:
"most" because we expect some tests not to match,
so the test runner reports `true`.
{: .continue}

[% inc file="regex-initial.out" %]

This output tells us how much work we have left to do:
when all of these tests pass,
we're finished.
{: .continue}

Let's implement a literal character string matcher first:

[% inc file="regex-beginning/regex-lit.js" %]

Some tests now pass, others still fail as expected:

[% inc file="regex-beginning.out" %]

We will tackle `RegexSeq` next so that we can combine other matchers.
This is why we have tests for `Seq(Lit('a'), Lit('b'))` and `Lit('ab')`:
all children have to match in order without gaps.

But wait:
suppose we have the pattern `/a*ab/`.
This ought to match the text `"ab"`, but will it?
The `/*/` is [%i "greedy algorithm" "algorithm!greedy" %][%g greedy_algorithm "greedy" %][%/i%]: it matches as much as it can
(which is also called [%i "eager matching" "matching!eager" %][%g eager_matching "eager matching" %][%/i%]).
As a result,
`/a*/` will match the leading `"a"`, leaving nothing for the literal `/a/` to match
([%f pattern-matching-greedy-failure %]).
Our current implementation doesn't give us a way to try other possible matches when this happens.

[% figure
   slug="pattern-matching-greedy-failure"
   img="greedy-failure.svg"
   alt="Overly-greedy matching fails"
   caption="Why overly greedy matching doesn't work."
%]

Let's re-think our design
and have each matcher take its own arguments and a `rest` parameter containing the rest of the matchers
([%f pattern-matching-rest %]).
(We will provide a default of `null` in the creation function
so we don't have to type `null` over and over again.)
Each matcher will try each of its possibilities and then see if the rest will also match.

[% figure
   slug="pattern-matching-rest"
   img="rest.svg"
   alt="Matching the rest of the pattern"
   caption="Using `rest` to match the remainder of a pattern."
%]

This design means we can get rid of `RegexSeq`,
but it does make our tests a little harder to read:

[% inc file="regex-recursive/regex-complete.js" %]

Here's how this works for matching a literal expression:

[% inc file="regex-recursive/regex-lit.js" %]

The `_match` method checks whether all of the pattern matches the target text starting at the current location.
If so, it checks whether the rest of the overall pattern matches what's left.
Matching the start `/^/` and end `/$/` anchors is just as straightforward:
{: .continue}

<div class="pagebreak"></div>

[% inc file="regex-recursive/regex-start.js" %]

[% inc file="regex-recursive/regex-end.js" %]

Matching either/or is done by trying the first pattern and the rest,
and if that fails,
trying the second pattern and the rest:

[% inc file="regex-recursive/regex-alt.js" %]

To match a repetition,
we figure out the maximum number of matches that might be left,
then count down until something succeeds.
(We start with the maximum because matching is supposed to be greedy.)
Each non-empty repetition matches at least one character,
so the number of remaining characters is the maximum number of matches worth trying.

[% inc file="regex-recursive/regex-any.js" %]

With these classes in place,
our tests all pass:

[% inc file="regex-recursive.out" %]

The most important thing about this design is how extensible it is:
if we want to add other kinds of matching,
all we have to do is add more classes.
That extensibility comes from the lack of centralized decision-making,
which in turn comes from our use of polymorphism
and the [%i "Chain of Responsibility pattern" "design pattern!Chain of Responsibility" %][%g chain_of_responsibility_pattern "Chain of Responsibility" %][%/i%] design pattern.
Each component does its part and asks something else to handle the remaining work;
so long as each component takes the same inputs,
we can put them together however we want.

<div class="callout" markdown="1">

### The Open-Closed Principle

The [%i "Open-Closed Principle" "software design!Open-Closed Principle" %][%g open_closed_principle "Open-Closed Principle" %][%/i%] states that
software should be open for extension but closed for modification,
i.e., that it should be possible to extend functionality
without having to rewrite existing code.
As we said in [%x async-programming %],
this allows old code to use new code,
but only if our design permits the kinds of extensions people are going to want to make.
Since we can't anticipate everything,
it is normal to have to revise a design the first two or three times we try to extend it.
Looking at it another way,
the things we build learn how to do their jobs better
as we use them and improve them [%b Brand1995 %].

</div>

## Exercises {: #pattern-matching-exercises}

### Split once {: .exercise}

Modify the query selector code so that selectors like `div#id` and `div.class` are only split into pieces once
rather than being re-split each time `matchHere` is called.

### Find and fix the error {: .exercise}

The first regular expression matcher contains an error:
the pattern `'a*ab'` should match the string `'aab'` but doesn't.
Figure out why it fails and fix it.

### Unit tests {: .exercise}

Rewrite the tests for selectors and regular expressions to use Mocha.

### Find all with query selectors {: .exercise}

Modify the query selector so that it returns *all* matches, not just the first one.

### Select based on attributes {: .exercise}

Modify the query selector to handle `[attribute="value"]` selectors,
so that (for example) `div[align=center]` returns all `div` elements
whose `align` attribute has the value `"center"`.

### Child selectors {: .exercise}

The expression `parent > child` selects all nodes of type `child`
that are immediate children of nodes of type `parent`---for example,
`div > p` selects all paragraphs that are immediate children of `div` elements.
Modify `simple-selectors.js` to handle this kind of matching.

### Find all with regular expressions {: .exercise}

Modify the regular expression matcher to return *all* matches rather than just the first one.

### Find one or more with regular expressions {: .exercise}

Extend the regular expression matcher to support `+`, meaning "one or more".

### Match sets of characters {: .exercise}

Add a new regular expression matching class that matches any character from a set,
so that `Charset('aeiou')` matches any lower-case vowel.

### Make repetition more efficient {: .exercise}

Rewrite `RegexAny` so that it does not repeatedly re-match text.

### Lazy matching {: .exercise}

The regular expressions we have seen so far are [%g eager_matching "eager" %]:
they match as much as they can, as early as they can.
An alternative is [%g lazy_matching "lazy matching" %],
in which expressions match as little as they need to.
For example,
given the string `"ab"`,
an eager match with the expression `/ab*/` will match both letters
(because `/b*/` matches a 'b' if one is available)
but a lazy match will only match the first letter
(because `/b*/` can match no letters at all).
Implement lazy matching for the `*` operator.

### Optional matching {: .exercise}

The `?` operator means "optional",
so that `/a?/` matches either zero or one occurrences of the letter 'a'.
Implement this operator.
