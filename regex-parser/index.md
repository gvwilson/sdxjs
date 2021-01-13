---
---

In the <x key="pattern-matching">previous chapter</x>
we created regular expressions out of objects.
Writing them as strings,
as we did for HTML selectors,
takes a lot less typing,
but if we're going to do that we need to build something
to convert those strings to the required objects.

Here is the grammar that we will parse:

<%- include('/inc/table.html', {
    id: 'regex-parser-grammar-codes',
    file: 'grammar.tbl',
    cap: 'Regular expression grammar.'
}) %>

When we are done
we should be able to parse `/^(a|b|$)*z$/` as
"start of text",
"any number of 'a', 'b', or '$'",
"a single 'z',
and "end of text".
We will create a tree of objects rather than instances of the `RegexBase` classes
from <x key="pattern-matching"></x> to keep things simple
(<f key="regex-parser-expression-tree"></f>);
the exercises will build the latter.

<%- include('/inc/figure.html', {
    id: 'regex-parser-expression-tree',
    img: './figures/expression-tree.svg',
    alt: 'Expression tree for regular expression',
    cap: 'Representing the result of parsing a regular expression as an tree.'
}) %>

::: callout
### Please don't write parsers

Languages that are comfortable for people to read are often difficult for computers to understand
and vice versa,
so we can often make tools and libraries easier for people to use
by translating human-friendly notation into computer-friendly representations.
On the other hand,
the world doesn't need more file formats,
so if you need a configuration file or lookup table,
please save it as CSV, JSON, <g key="yaml">YAML</g>,
or something else that already has an acronym
rather than inventing a format of your own.
That said,
understanding how parsers work can help make error messages comprehensible.
:::

## How can we break text into tokens?

A <g key="token">token</g> is an atom of text,
such as a number or a variable name.
In this case our tokens are the characters `*`, `|`, `(`, `)`, `^`, and `$`,
and any sequence of one or more other characters.
This classification guides the design of our parser:

1.  If a character is special, create a token for it.

1.  If it is a <g key="literal">literal</a> then:
    1.  combine it with the current literal if there is one, or
    1.  start a new literal.

1.  Since `^` and `$` are either special or regular depending on position,
    we must treat them as separate tokens or as part of a literal
    based on where they are in the string being parsed.

We can translate these rules almost directly into code:

<%- include('/inc/erase.html', {file: 'tokenizer-collapse.js', key: 'combine'}) %>

The helper function `combineOrPush` does exactly what its name says.
If the thing most recently added to the list of tokens isn't a literal,
the new character becomes a new token;
otherwise,
we append the new character to the literal we're building:

<%- include('/inc/keep.html', {file: 'tokenizer-collapse.js', key: 'combine'}) %>

This simple tokenizer is readable, efficient, and wrong.
The problem is that the expression `/ab*/` means "a single `a` followed by zero or more `b`".
If we combine the `a` and `b` as we read them,
though,
we wind up with "zero or more repetitions of `ab`".
(Don't feel bad if you didn't spot this:
we didn't notice the problem until we were implementing the next step.)

The solution is to treat each regular character as its own literal in this stage
and then combine things later.
Doing this lets us get rid of the nested `if` for handling `^` and `$` as well:

<%- include('/inc/file.html', {file: 'tokenizer.js'}) %>

Software isn't done until it's tested,
so let's build some [Mocha][mocha] tests for our tokenizer.
The listing below shows a few of these
along with the output for the full set:

<%- include('/inc/erase.html', {file: 'test/test-tokenizer.js', key: 'omit'}) %>
<%- include('/inc/file.html', {file: 'tokenizer-test.out'}) %>

## How can we turn a stream of tokens into a tree?

We now have a list of tokens,
but we need a tree that captures the nesting introduced by parentheses
and the way that `*` applies to whatever comes before it.
In order to see how to build this tree,
let's trace a few cases.

1.  If the regular expression is `/a/`, we create a `Lit` token for the letter `a`
    (where "create" means "append to the output list").

1.  What if the regular expression is `/a*/`?
    We first create a `Lit` token for the `a` and append it to the output list.
    When we see the `*`,
    we take that `Lit` token off the tail of the output list
    and replace it with an `Any` token that has the `Lit` token as its child.

1.  Our next thought experiment is `/(ab)/`.
    We don't know how long the group is going to be when we see the `(`,
    so we put it onto the output as a marker.
    We then add the `Lit` tokens for the `a` and `b`
    until we see the `)`,
    at which point we pull tokens off the end of the output list
    until we get back to the `(` marker.
    When we find it,
    we put everything we have temporarily collected into a `Group` token and append it to the output list.
    This algorithm automatically handles `/(a*)/`
    (trace it through).

1.  What about `/a|b/`?
    We append a `Lit` token for `a`, get the `|` and---and we're stuck,
    because we don't yet have the next token we need to finish building the `Alt`.

One way to solve this problem is to check to see if the thing on the top of the stack is waiting to combine
each time we append a new token.
However,
this doesn't handle `/a|b*/` properly.
The pattern is supposed to mean "one `a` or any number of `b`",
but the check-and-combine strategy will turn it into the equivalent of `/(a|b)*/`.

A better (i.e., correct) solution is
to leave some partially-completed tokens in the output and compress them later
(<f key="regex-parser-mechanics"></f>).
If our input is the pattern `/a|b/`, we can:

1.  Append a `Lit` token for `a`.

1.  When we see `|`,
    make that `Lit` token the left child of the `Alt`
    and append that without filling in the right child.

1.  Append the `Lit` token for `b`.

1.  After all tokens have been handled,
    look for partially-completed `Alt` tokens and make whatever comes after them their right child.

Again, this automatically handles patterns like `/(ab)|c*|(de)/`.

<%- include('/inc/figure.html', {
    id: 'regex-parser-mechanics',
    img: './figures/mechanics.svg',
    alt: 'Mechanics of combining tokens',
    cap: 'Mechanics of combining tokens while parsing regular expressions.'
}) %>

Time to turn these ideas into code.
The main structure of our parser is:

<%- include('/inc/erase.html', {file: 'parser.js', key: 'skip'}) %>

We handle tokens case by case
(with a few assertions to check that patterns are <g key="well_formed">well formed</g>):

<%- include('/inc/keep.html', {file: 'parser.js', key: 'handle'}) %>

When we find the `)` that marks the end of a group,
we take items from the end of the output list
until we find the matching start:

<%- include('/inc/keep.html', {file: 'parser.js', key: 'groupend'}) %>

Finally,
when we have finished with the input,
we go through the output list one last time to fill in the right side of `Alt`s:

<%- include('/inc/keep.html', {file: 'parser.js', key: 'compress'}) %>

Once again,
it's not done until we've tested it:

<%- include('/inc/erase.html', {file: 'test/test-parser.js', key: 'omit'}) %>
<%- include('/inc/file.html', {file: 'parser-test.out'}) %>

While our final parser is less than 90 lines of code,
it is doing a lot of complex things.
Compared to parsers for things like JSON and YAML,
though,
it is still very simple.
If we have more operators with different <g key="precedence">precedences</g>
we should switch to the [shunting-yard algorithm][shunting-yard-algorithm],
and if we need to handle a language like JavaScript we should explore tools like [ANTLR][antlr],
which can geneate a parser automatically given a description of the language to be parsed.
But as we implied at the start,
if our design requires us to write a parser we should try to come up with a better design.
