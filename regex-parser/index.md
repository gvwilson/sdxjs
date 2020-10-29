---
---

-   Please don't write parsers
    -   Languages that are comfortable for people to read are often very difficult for computers
    -   And the world really (really) doesn't need more data formats
-   But someone has to
    -   And understanding how they work can help make error messages comprehensible
-   So let's parse some simple regular expressions

| Character | Meaning |
| --------- | ------- |
| *c*       | Any literal character *c* |
| ^         | Beginning of input |
| $         | End of input |
| *         | Zero or more of the previous thing |
| \|        | Either/or |
| (...)     | Grouping |

-   So we should be able to parse `^(a|b|$)*z$` as
    "start of text",
    "any number of 'a', 'b', or '$'",
    "a single 'z',
    and "end of text".
-   We will return a tree of objects rather than instances of the `RegexBase` classes
    from <xref key="pattern-matching"></xref> to keep things simple

## How can we break text into tokens?

-   A <g key="token">token</g> is an atom of text, such as a number or a variable name
-   In this case, our tokens are the characters `*`, `|`, `(`, `)`, `^`, and `$`,
    and any sequence of one or more other characters
-   Look at each character
    -   If it is a special character, create a token
    -   If it is a literal:
        -   Combine it with the current literal if there is one
        -   Or start a new literal
    -   Note that `^` and `$` are either special or regular depending on position

<%- include('/_inc/file.html', {file: 'tokenizer-collapse.js'}) %>

-   This is readable, efficient, and wrong
    -   The expression `ab*` means "a single `a` followed by zero or more `b`"
    -   But if we combine the `a` and `b` as we read them,
        we wind up with "zero or more repetitions of `ab`"
    -   We didn't figure this out until we were implementing the next step
-   Solution is to treat each regular character as its own literal in this stage
    and combine things later
    -   And we can get rid of the nested `if` for handling `^` and `$` as well

<%- include('/_inc/file.html', {file: 'tokenizer.js'}) %>

-   It's not done until it's tested

<%- include('/_inc/file.html', {file: 'test/test-tokenizer.js'}) %>
<%- include('/_inc/file.html', {file: 'tokenizer-test.txt'}) %>

## How can we turn a stream of tokens into a tree?

-   Trace a few cases
-   Regular expression is `/a/`, so we create a `Lit` token for the letter `a`
    -   By "create", we mean "append to the output list"
-   Now the regular expression is `/a*/`
    -   We create a `Lit` token for the `a`
    -   When we see the `*`,
        we take that `Lit` token off the tail of the output
        and replace it with an `Any` token that has the `Lit` token as its child
-   Next regular expression is `/(ab)/`
    -   We don't know how long the group is going to be when we see the `(`
    -   So we put it onto the output as a marker
    -   Then add the `Lit` tokens for the `a` and `b`
    -   When we see the `)`, we pull tokens off the end of the output until we get to the `(` marker
    -   Put everything we found into a `Group` token and append it to the output
    -   This automatically handles `/(a*)/`
-   What about `/a|b/`?
    -   Append a `Lit` token for `a`
    -   Get the `|` and... hm.
    -   We don't have the next token yet
-   Option 1: every time we push a token, check to see if the thing on the top of the stack is waiting to combine
    -   But what about `/a|b*/`, which is supposed to mean "one `a` or any number of `b`"?
-   Solve this by leaving some partially-completed tokens in the output and compressing them later
    -   For `/a|b/`, append `Lit` for `a`
    -   When we see `|`, take the `Lit` token,
        make it the left child of the `Alt`,
        and append that without filling in the right child
    -   After all tokens have been handled,
        look for partially-completed `Alt` tokens and make whatever comes after the right child
    -   Again, this will automatically work for things like `/(ab)|c*|(de)/`

<%- include('/_inc/file.html', {file: 'parser.js'}) %>

-   And some tests

<%- include('/_inc/file.html', {file: 'test/test-parser.js'}) %>
<%- include('/_inc/file.html', {file: 'parser-test.txt'}) %>

-   If we have more operators with different <g key="precedence">precedences</g>
    we should switch to the [shunting-yard algorithm][shunting-yard-algorithm]
-   But as we implied at the start,
    if our design requires us to write a parser we should try to come up with a better design
