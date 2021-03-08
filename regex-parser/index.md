---
---

In <span x="pattern-matching"></span> we created regular expressions by constructing objects.
It takes a lot less typing to write them as strings as we did for HTML selectors,
but if we're going to do that we need something to convert those strings to the required objects.
In other words, we need to write a <span g="parser">parser</span>.

{% include table id='regex-parser-grammar-codes' file='grammar.tbl' cap='Regular expression grammar.' %}

<span t="regex-parser-grammar-codes"></span> shows the grammar we will handle.
When we are done
we should be able to parse `/^(a|b|$)*z$/` as
"start of text",
"any number of 'a', 'b', or '$'",
"a single 'z',
and "end of text".
(We write regular expressions inside slashes to distinguish them from strings.)
To keep things simple,
we will create a tree of objects (<span f="regex-parser-expression-tree"></span>)
rather than instances of the regular expression classes from <span x="pattern-matching"></span>;
the exercises will tackle the latter.

{% include figure id='regex-parser-expression-tree' img='figures/expression-tree.svg' alt='Expression tree for regular expression' cap='Representing the result of parsing a regular expression as an tree.' %}

<div class="callout" markdown="1">

### Please don't write parsers

Languages that are comfortable for people to read are usually difficult for computers to understand
and vice versa,
so we need parsers to translate human-friendly notation into computer-friendly representations.
However,
the world doesn't need more file formats;
if you need a configuration file or lookup table,
please use CSV, JSON, <span g="yaml">YAML</span>,
or something else that already has an acronym
rather than inventing a format of your own.

</div>

## How can we break text into tokens?

A <span g="token">token</span> is an atom of text,
such as the digits making up a number or the letters making up a variable name.
In our grammar the tokens are the special characters `*`, `|`, `(`, `)`, `^`, and `$`,
plus any sequence of one or more other characters (which count as one multi-letter token).
This classification guides the design of our parser:

1.  If a character is special, create a token for it.

1.  If it is a <span g="literal">literal</span> then:
    1.  combine it with the current literal if there is one, or
    1.  start a new literal.

1.  Since `^` and `$` are either special or regular depending on position,
    we must treat them as separate tokens or as part of a literal
    based on where they appear.

We can translate these rules almost directly into code
to create a list of objects whose keys are `kind` and `loc` (short for location),
with the extra key `value` for literal values:

{% include erase file='tokenizer-collapse.js' key='combine' %}

The helper function `combineOrPush` does exactly what its name says.
If the thing most recently added to the list of tokens isn't a literal,
the new character becomes a new token;
otherwise,
we append the new character to the literal we're building:

{% include keep file='tokenizer-collapse.js' key='combine' %}

We can try this out with a three-line test program:

{% include multi pat='tokenizer-collapse-example.*' fill='js out' %}

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

{% include file file='tokenizer.js' %}

Software isn't done until it's tested,
so let's build some [Mocha][mocha] tests for our tokenizer.
The listing below shows a few of these
along with the output for the full set:

{% include erase file='test/test-tokenizer.js' key='omit' %}
{% include file file='tokenizer-test.out' %}

## How can we turn a list of tokens into a tree?

We now have a list of tokens,
but we need a tree that captures the nesting introduced by parentheses
and the way that `*` applies to whatever comes before it.
Let's trace a few cases in order to see how to build this tree:

1.  If the regular expression is `/a/`, we create a `Lit` token for the letter `a`
    (where "create" means "append to the output list").

1.  What if the regular expression is `/a*/`?
    We first create a `Lit` token for the `a` and append it to the output list.
    When we see the `*`,
    we take that `Lit` token off the tail of the output list
    and replace it with an `Any` token that has the `Lit` token as its child.

1.  Our next thought experiment is `/(ab)/`.
    We don't know how long the group is going to be when we see the `(`,
    so we put the parenthesis onto the output as a marker.
    We then add the `Lit` tokens for the `a` and `b`
    until we see the `)`,
    at which point we pull tokens off the end of the output list
    until we get back to the `(` marker.
    When we find it,
    we put everything we have temporarily collected into a `Group` token and append it to the output list.
    This algorithm automatically handles `/(a*)/` and `/(a(b*)c)/`.

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
(<span f="regex-parser-mechanics"></span>).
If our input is the pattern `/a|b/`, we can:

1.  Append a `Lit` token for `a`.

1.  When we see `|`,
    make that `Lit` token the left child of the `Alt`
    and append that without filling in the right child.

1.  Append the `Lit` token for `b`.

1.  After all tokens have been handled,
    look for partially-completed `Alt` tokens and make whatever comes after them their right child.

Again, this automatically handles patterns like `/(ab)|c*|(de)/`.

{% include figure id='regex-parser-mechanics' img='figures/mechanics.svg' alt='Mechanics of combining tokens' cap='Mechanics of combining tokens while parsing regular expressions.' %}

It's time to turn these ideas into code.
The main structure of our parser is:

{% include erase file='parser.js' key='skip' %}

We handle tokens case by case
(with a few assertions to check that patterns are <span g="well_formed">well formed</span>):

{% include keep file='parser.js' key='handle' %}

When we find the `)` that marks the end of a group,
we take items from the end of the output list
until we find the matching start
and use them to create a group:

{% include keep file='parser.js' key='groupend' %}

Finally,
when we have finished with the input,
we go through the output list one last time to fill in the right side of `Alt`s:

{% include keep file='parser.js' key='compress' %}

Once again,
it's not done until we've tested it:

{% include erase file='test/test-parser.js' key='omit' %}
{% include file file='parser-test.out' %}

While our final parser is less than 90 lines of code,
it is doing a lot of complex things.
Compared to parsers for things like JSON and YAML,
though,
it is still very simple.
If we have more operators with different <span g="precedence">precedences</span>
we should switch to the [shunting-yard algorithm][shunting-yard-algorithm],
and if we need to handle a language like JavaScript we should explore tools like [ANTLR][antlr],
which can generate a parser automatically given a description of the language to be parsed.
As we said at the start,
though,
if our design requires us to write a parser we should try to come up with a better design.
CSV, JSON, YAML, and other formats [have their quirks][third-bit-nice-things],
but at least they're broken the same way everywhere.

<div class="callout" markdown="1">

### The limits of computing

One of the most important theoretical results in computer science is that
every formal language corresponds to a type of abstract machine and vice versa,
and that some languages (or machines) are more or less powerful than others.
For example,
every regular expression corresponds to a <span g="fsm">finite state machine</span> (FSM)
like the one in <span f="regex-parser-finite-state-machine"></span>.
As powerful as FSMs are,
they cannot match things like nested parentheses or HTML tags,
and [attempting to do so is a sin][stack-overflow-html-regex].
If you add a stack to the system you can process a much richer set of languages,
and if you add two stacks you have something equivalent to a <span g="turing_machine">Turing Machine</span>
that can do any conceivable computation.
<cite>Conery2021</cite> presents this idea and others for self-taught developers.

</div>

{% include figure id='regex-parser-finite-state-machine' img='figures/finite-state-machine.svg' alt='Finite state machine' cap='A finite state machine equivalent to a regular expression.' %}
