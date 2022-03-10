---
template: page
title: "Pattern Matching"
lede: "Using patterns to find things in data"
---

We have been globbing to match filenames against patterns since <a section="systems-programming"/>.
This lesson will explore how that works
by building a simple version of the <span g="regular_expression" i="regular expression">regular expressions</span>
used to match text in everything from editor and shell commands to web scrapers.
Our approach is inspired by <span i="Kernighan, Brian">[Brian Kernighan's][kernighan-brian]</span> entry
in <cite>Oram2007</cite>.

Regular expressions have inspired pattern matching for many other kinds of data,
such as <span g="query_selector" i="query selector (for HTML)">query selectors</span> for HTML.
They are easier to understand and implement than patterns for matching text,
so we will start by looking at them.

## How can we match query selectors? {#pattern-matching-selectors}

Programs stores HTML pages in memory using a <span g="dom" i="DOM; Document Object Model">document object model</span> or DOM.
Each element in the page,
such as a heading and or paragraph,
is a <span g="node">nodes</span>;
the <span g="child_tree">children</span> of a node are the elements it contains
(<a figure="pattern-matching-dom-tree"/>).

[% figure slug="pattern-matching-dom-tree" img="figures/dom-tree.svg" alt="The Document Object Model" caption="Representing an HTML document as a tree." %]

The first step is to define the patterns we want to support
(<a table="pattern-matching-supported"/>).

<div class="table" id="pattern-matching-supported" caption="Supported patterns.">
| Meaning | Selector |
| ------- | -------- |
| Element with tag `"elt"` | `elt`    |
| Element with `class="cls"` | `.cls`   |
| Element with `id="ident"` | `#ident`   |
| `child` element inside a `parent` element | `parent child` |
</div>

According to this grammar,
`blockquote#important p.highlight` is a highlighted paragraph inside the blockquote whose ID is `"important"`.
To find elements in a page that match it,
our `select` function breaks the query into pieces
and uses `firstMatch` to search recursively down the document tree
until all the selectors in the query string have matched or no matches have been found
(<a figure="pattern-matching-query-selectors"/>).

[% figure slug="pattern-matching-query-selectors" img="figures/query-selectors.svg" alt="Matching query selectors" caption="Matching a simple set of query selectors." %]

<div class="include" file="simple-selectors.js" omit="skip" />

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

This algorithm is called <span g="depth_first" i="depth-first search; search!depth-first">depth-first search</span>:
it explores one possible match to the end before considering any others.
`firstMatch` relies on a helper function called `firstChildMatch`,
which finds the first child of a node to match a set of selectors:

<div class="include" file="simple-selectors.js" keep="firstChild" />

<!-- continue -->
and on the function `matchHere` which compares a node against a selector:

<div class="include" file="simple-selectors.js" keep="matchHere" />

This version of `matchHere` is simple but inefficient,
since it breaks the selector into parts each time it is called
rather than doing that once and re-using the results.
We will build a more efficient version in the exercises,
but let's try out the one we have.
Our test cases are all in one piece of HTML:

<div class="include" file="simple-selectors-test.js" keep="tests" />

The program contains a table of queries and the expected matches.
The function `main` loops over it to report whether each test passes or fails:

<div class="include" file="simple-selectors-test.js" keep="main" />

<!-- continue -->
`main` uses a helper function called `getText` to extract text from a node
or return an error message if something has gone wrong:

<div class="include" file="simple-selectors-test.js" keep="getText" />

When we run our program it produces this result:

<div class="include" file="simple-selectors-test.out" />

We will rewrite these tests using <span i="Mocha">[Mocha][mocha]</span> in the exercises.

> ### Test then build
>
> We actually wrote our test cases *before* implementing the code to match query selectors
> in order to give ourselves a goal to work toward.
> Doing this is called <span g="tdd" i="test-driven development; TDD">test-driven development</span>, or TDD;
> while research doesn't support the claim that
> it makes programmers more productive <cite>Fucci2016,Fucci2017</cite>,
> we find it helps prevent <span g="scope_creep" i="scope creep!when writing lessons">scope creep</span> when writing lessons.

## How can we implement a simple regular expression matcher? {#pattern-matching-re}

Matching regular expressions against text relies on the same recursive strategy
as matching query selectors against nodes in an HTML page.
If the first element of the pattern matches where we are,
we see if the rest of the pattern matches what's left;
otherwise,
we see if the the pattern will match further along.
Our matcher will initially handle just the five cases shown in
<a table="pattern-matching-cases"/>.

<div class="table" id="pattern-matching-cases" caption="Pattern matching cases.">
| Meaning | Character |
| ------- | --------- |
| Any literal character *c* | *c* |
| Any single character | . |
| Beginning of input | ^ |
| End of input | $ |
| Zero or more of the previous character | * |
</div>

<!-- continue -->
These five cases are a small subset of what JavaScript provides,
but as <span i="Kernighan, Brian">Kernighan</span> wrote,
"This is quite a useful class;
in my own experience of using regular expressions on a day-to-day basis,
it easily accounts for 95 percent of all instances."

The top-level function that users call
handles the special case of `^` at the start of a pattern
matching the start of the target string being searched.
It then tries the pattern against each successive substring of the target string
until it finds a match or runs out of characters:

<div class="include" file="simple-regex.js" keep="match" />

`matchHere` does the matching and recursing:

<div class="include" file="simple-regex.js" keep="matchHere" />

Once again,
we use a table of test cases and expected results to test it:

<div class="include" file="simple-regex.js" keep="tests" />
<div class="include" file="simple-regex.out" />

This program seems to work,
but it actually contains an error that we will correct in the exercises.
(Think about what happens if we match the pattern `/a*ab/` against the string `'aab'`.)
Our design is also hard to extend:
handling parentheses in patterns like `/a(bc)*d/` will require major changes.
We need to explore a different approach.

## How can we implement an extensible matcher? {#pattern-matching-extensible}

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
(<a figure="pattern-matching-regex-objects"/>).

[% figure slug="pattern-matching-regex-objects" img="figures/regex-objects.svg" alt="Implementing regex with objects" caption="Using nested objects to match regular expressions." %]

The first step in implementing this is is to write test cases,
which forces us to define the syntax we are going to support:

<div class="include" file="regex-initial/regex-complete.js" />

Next,
we define a <span g="base_class">base class</span> that all matchers will inherit from.
This class contains the `match` method that users will call
so that we can start matching right away
no matter what kind of matcher we have at the top level of our pattern.

<div class="include" file="regex-initial/regex-base.js" />

<!-- continue -->
The base class also defines a `_match` method (with a leading underscore)
that other classes will fill in with actual matching code.
The base implementation of this method throws an exception
so that if we forget to provide `_match` in a <span g="derived_class">derived class</span>
our code will fail with a meaningful reminder.

> ### One interface to call them all
>
> Our design makes use of <span g="polymorphism" i="polymorphism (in software design); software design!polymorphism">polymorphism</span>,
> which literally means "having multiple forms".
> If a set of objects all have methods that can be called the same way,
> then those objects can be used interchangeably;
> putting it another way,
> a program can use them without knowing exactly what they are.
> Polymorphism reduces the <span g="coupling" i="coupling; software design!coupling">coupling</span> between different parts of our program,
> which in turn makes it easier for those programs to evolve.

We can now define empty versions of each matching class that all say "no match here"
like this one for literal characters:

<div class="include" file="regex-initial/regex-lit.js" />

<!-- continue -->
Our tests now run, but most of them fail:
"most" because we expect some tests not to match,
so the test runner reports `true`.

<div class="include" file="regex-initial.out" />

<!-- continue -->
This output tells us how much work we have left to do:
when all of these tests pass,
we're finished.

Let's implement a literal character string matcher first:

<div class="include" file="regex-beginning/regex-lit.js" />

Some tests now pass, others still fail as expected:

<div class="include" file="regex-beginning.out" />

We will tackle `RegexSeq` next so that we can combine other matchers.
This is why we have tests for `Seq(Lit('a'), Lit('b'))` and `Lit('ab')`:
all children have to match in order without gaps.

But wait:
suppose we have the pattern `/a*ab/`.
This ought to match the text `"ab"`, but will it?
The `/*/` is <span g="greedy_algorithm" i="greedy algorithm; algorithm!greedy">greedy</span>: it matches as much as it can
(which is also called <span g="eager_matching" i="eager matching; matching!eager">eager matching</span>).
As a result,
`/a*/` will match the leading `"a"`, leaving nothing for the literal `/a/` to match
(<a figure="pattern-matching-greedy-failure"/>).
Our current implementation doesn't give us a way to try other possible matches when this happens.

[% figure slug="pattern-matching-greedy-failure" img="figures/greedy-failure.svg" alt="Overly-greedy matching fails" caption="Why overly-greedy matching doesn't work." %]

Let's re-think our design
and have each matcher take its own arguments and a `rest` parameter containing the rest of the matchers
(<a figure="pattern-matching-rest"/>).
(We will provide a default of `null` in the creation function
so we don't have to type `null` over and over again.)
Each matcher will try each of its possibilities and then see if the rest will also match.

[% figure slug="pattern-matching-rest" img="figures/rest.svg" alt="Matching the rest of the pattern" caption="Using "rest" to match the remainder of a pattern." %]

This design means we can get rid of `RegexSeq`,
but it does make our tests a little harder to read:

<div class="include" file="regex-recursive/regex-complete.js" />

Here's how this works for matching a literal expression:

<div class="include" file="regex-recursive/regex-lit.js" />

<!-- continue -->
The `_match` method checks whether all of the pattern matches the target text starting at the current location.
If so, it checks whether the rest of the overall pattern matches what's left.
Matching the start `/^/` and end `/$/` anchors is just as straightforward:

<div class="include" file="regex-recursive/regex-start.js" />

<div class="include" file="regex-recursive/regex-end.js" />

Matching either/or is done by trying the first pattern and the rest,
and if that fails,
trying the second pattern and the rest:

<div class="include" file="regex-recursive/regex-alt.js" />

To match a repetition,
we figure out the maximum number of matches that might be left,
then count down until something succeeds.
(We start with the maximum because matching is supposed to be greedy.)
Each non-empty repetition matches at least one character,
so the number of remaining characters is the maximum number of matches worth trying.

<div class="include" file="regex-recursive/regex-any.js" />

With these classes in place,
our tests all pass:

<div class="include" file="regex-recursive.out" />

The most important thing about this design is how extensible it is:
if we want to add other kinds of matching,
all we have to do is add more classes.
That extensibility comes from the lack of centralized decision-making,
which in turn comes from our use of polymorphism
and the <span g="chain_of_responsibility_pattern" i="Chain of Responsibility pattern; design pattern!Chain of Responsibility">Chain of Responsibility</span> design pattern.
Each component does its part and asks something else to handle the remaining work;
so long as each component takes the same inputs,
we can put them together however we want.

> ### The Open-Closed Principle
>
> The <span g="open_closed_principle" i="Open-Closed Principle; software design!Open-Closed Principle">Open-Closed Principle</span> states that
> software should be open for extension but closed for modification,
> i.e., that it should be possible to extend functionality
> without having to rewrite existing code.
> As we said in <a section="async-programming"/>,
> this allows old code to use new code,
> but only if our design permits the kinds of extensions people are going to want to make.
> Since we can't anticipate everything,
> it is normal to have to revise a design the first two or three times we try to extend it.
> As <cite>Brand1995</cite> said of buildings,
> the things we make learn how to do things better as we use them.

## Exercises {#pattern-matching-exercises}

### Split once {.exercise} {.exercise}

Modify the query selector code so that selectors like `div#id` and `div.class` are only split into pieces once
rather than being re-split each time `matchHere` is called.

### Find and fix the error {.exercise} {.exercise}

The first regular expression matcher contains an error:
the pattern `'a*ab'` should match the string `'aab'` but doesn't.
Figure out why it fails and fix it.

### Unit tests {.exercise} {.exercise}

Rewrite the tests for selectors and regular expressions to use Mocha.

### Find all with query selectors {.exercise} {.exercise}

Modify the query selector so that it returns *all* matches, not just the first one.

### Select based on attributes {.exercise} {.exercise}

Modify the query selector to handle `[attribute="value"]` selectors,
so that (for example) `div[align=center]` returns all `div` elements
whose `align` attribute has the value `"center"`.

### Child selectors {.exercise} {.exercise}

The expression `parent > child` selects all nodes of type `child`
that are immediate children of nodes of type `parent`---for example,
`div > p` selects all paragraphs that are immediate children of `div` elements.
Modify `simple-selectors.js` to handle this kind of matching.

### Find all with regular expressions {.exercise} {.exercise}

Modify the regular expression matcher to return *all* matches rather than just the first one.

### Find one or more with regular expressions {.exercise} {.exercise}

Extend the regular expression matcher to support `+`, meaning "one or more".

### Match sets of characters {.exercise} {.exercise}

Add a new regular expression matching class that matches any character from a set,
so that `Charset('aeiou')` matches any lower-case vowel.

### Make repetition more efficient {.exercise} {.exercise}

Rewrite `RegexAny` so that it does not repeatedly re-match text.

### Lazy matching {.exercise} {.exercise}

The regular expressions we have seen so far are <span g="eager_matching">eager</span>:
they match as much as they can, as early as they can.
An alternative is <span g="lazy_matching">lazy matching</span>,
in which expressions match as little as they need to.
For example,
given the string `"ab"`,
an eager match with the expression `/ab*/` will match both letters
(because `/b*/` matches a 'b' if one is available)
but a lazy match will only match the first letter
(because `/b*/` can match no letters at all).
Implement lazy matching for the `*` operator.

### Optional matching {.exercise} {.exercise}

The `?` operator means "optional",
so that `/a?/` matches either zero or one occurrences of the letter 'a'.
Implement this operator.
