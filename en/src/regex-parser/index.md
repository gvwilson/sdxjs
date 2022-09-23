---
title: "Parsing Expressions"
---

In [%x pattern-matching %] we created regular expressions by constructing objects.
It takes a lot less typing to write them as strings as we did for HTML selectors,
but if we're going to do that we need something to convert those strings to the required objects.
In other words, we need to write a [%i "parser" %][%g parser "parser" %][%/i%].

<div class="table table-here" id="regex-parser-grammar-codes" caption="Regular expression grammar." markdown="1">
| Meaning | Character |
| ------- | --------- |
| Any literal character *c* | *c* |
| Beginning of input | ^ |
| End of input | $ |
| Zero or more of the previous thing | \* |
| Either/or | \| |
| Grouping | (…) |
</div>

[%t regex-parser-grammar-codes %] shows the grammar we will handle.
When we are done
we should be able to parse `/^(a|b|$)*z$/` as
"start of text",
"any number of 'a', 'b', or '$'",
"a single 'z',
and "end of text".
(We write regular expressions inside slashes to distinguish them from strings.)
To keep things simple,
we will create a tree of objects ([%f regex-parser-expression-tree %])
rather than instances of the regular expression classes from [%x pattern-matching %];
the exercises will tackle the latter.

[% figure
   slug="regex-parser-expression-tree"
   img="expression-tree.svg"
   alt="Expression tree for regular expression"
   caption="Representing the result of parsing a regular expression as an tree."
%]

<div class="callout" markdown="1">

### Please don't write parsers

Languages that are comfortable for people to read are usually difficult for computers to understand
and vice versa,
so we need parsers to translate human-friendly notation into computer-friendly representations.
However,
[%i "parser!reasons not to write" %]the world doesn't need more file formats[%/i%];
if you need a configuration file or lookup table,
please use CSV, JSON, [%g yaml "YAML" %],
or something else that already has an acronym
rather than inventing a format of your own.

</div>

## How can we break text into tokens? {: #regex-parser-tokenize}

A [%i "token (in parsing)" %][%g token "token" %][%/i%] is an atom of text,
such as the digits making up a number or the letters making up a variable name.
In our grammar the tokens are the special characters `*`, `|`, `(`, `)`, `^`, and `$`,
plus any sequence of one or more other characters (which count as one multi-letter token).
This classification guides the design of our parser:

1.  If a character is special, create a token for it.

1.  If it is a [%i "literal (in parsing)" %][%g literal "literal" %][%/i%] then
    combine it with the current literal if there is one
    or start a new literal.

1.  Since `^` and `$` are either special or regular depending on position,
    we must treat them as separate tokens or as part of a literal
    based on where they appear.

We can translate these rules almost directly into code
to create a list of objects whose keys are `kind` and `loc` (short for location),
with the extra key `value` for literal values:

[% inc file="tokenizer-collapse.js" omit="combine" %]

The helper function `combineOrPush` does exactly what its name says.
If the thing most recently added to the list of tokens isn't a literal,
the new character becomes a new token;
otherwise,
we append the new character to the literal we're building:

[% inc file="tokenizer-collapse.js" keep="combine" %]

We can try this out with a three-line test program:

[% inc pat="tokenizer-collapse-example.*" fill="js out" %]

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

[% inc file="tokenizer.js" %]

Software isn't done until it's tested,
so let's build some [%i "Mocha" %][Mocha][mocha][%/i%] tests for our tokenizer.
The listing below shows a few of these
along with the output for the full set:

[% inc file="test/test-tokenizer.js" omit="omit" %]
[% inc file="tokenizer-test.out" %]

## How can we turn a list of tokens into a tree? {: #regex-parser-tree}

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

One way to solve this problem is to check if the thing on the top of the stack is waiting to combine
each time we append a new token.
However,
this doesn't handle `/a|b*/` properly.
The pattern is supposed to mean "one `a` or any number of `b`",
but the [%i "parser!check-and-combine" %]check-and-combine strategy[%/i%] will turn it into the equivalent of `/(a|b)*/`.
{: .continue}

A better (i.e., correct) solution is
to leave some partially-completed tokens in the output and [%i "parser!post-hoc compression strategy" %]compress[%/i%] them later
([%f regex-parser-mechanics %]).
If our input is the pattern `/a|b/`, we can:

1.  Append a `Lit` token for `a`.

1.  When we see `|`,
    make that `Lit` token the left child of the `Alt`
    and append that without filling in the right child.

1.  Append the `Lit` token for `b`.

1.  After all tokens have been handled,
    look for partially-completed `Alt` tokens and make whatever comes after them their right child.

Again, this automatically handles patterns like `/(ab)|c*|(de)/`.
{: .continue}

[% figure
   slug="regex-parser-mechanics"
   img="mechanics.svg"
   alt="Mechanics of combining tokens"
   caption="Mechanics of combining tokens while parsing regular expressions."
%]

It's time to turn these ideas into code.
The main structure of our parser is:

[% inc file="parser.js" omit="skip" %]

We handle tokens case-by-case
(with a few assertions to check that patterns are [%g well_formed "well formed" %]):

[% inc file="parser.js" keep="handle" %]

When we find the `)` that marks the end of a group,
we take items from the end of the output list
until we find the matching start
and use them to create a group:

[% inc file="parser.js" keep="groupend" %]

Finally,
when we have finished with the input,
we go through the output list one last time to fill in the right side of `Alt`s:

[% inc file="parser.js" keep="compress" %]

Once again,
it's not done until we've tested it:

[% inc file="test/test-parser.js" omit="omit" %]
[% inc file="parser-test.out" %]

While our final parser is less than 90 lines of code,
it is doing a lot of complex things.
Compared to parsers for things like JSON and YAML,
though,
it is still very simple.
If we have more operators with different [%i "operator precedence!implementing" %][%g precedence "precedences" %][%/i%]
we should switch to the [%i "shunting-yard algorithm" "parser!shunting-yard algorithm" %][shunting-yard algorithm][shunting_yard_algorithm][%/i%],
and if we need to handle a language like JavaScript we should explore tools like [%i "ANTLR" %][ANTLR][antlr][%/i%],
which can generate a parser automatically given a description of the language to be parsed.
As we said at the start,
though,
if our design requires us to write a parser we should try to come up with a better design.
CSV, JSON, YAML, and other formats [have their quirks][third_bit_nice_things],
but at least they're broken the same way everywhere.

<div class="callout" markdown="1">

### The limits of computing

One of the most important theoretical results in computer science is that
every formal language corresponds to a type of abstract machine and vice versa,
and that some languages (or machines) are more or less powerful than others.
For example,
every regular expression corresponds to a [%i "finite state machine!correspondence with regular expressions" %][%g fsm "finite state machine" %][%/i%] (FSM)
like the one in [%f regex-parser-finite-state-machine %].
As powerful as FSMs are,
they cannot match things like nested parentheses or HTML tags,
and [%i "sin!using regular expressions to parse HTML" %][attempting to do so is a sin][stack-overflow-html-regex][%/i%].
If you add a stack to the system you can process a much richer set of languages,
and if you add two stacks you have something equivalent to a [%i "Turing Machine" %][%g turing_machine "Turing Machine" %][%/i%]
that can do any conceivable computation.
[%b Conery2021 %] presents this idea and others for self-taught developers.

</div>

[% figure
   slug="regex-parser-finite-state-machine"
   img="finite-state-machine.svg"
   alt="Finite state machine"
   caption="A finite state machine equivalent to a regular expression."
%]

## Exercises {: #regex-parser-exercises}

### Create objects {: .exercise}

Modify the parser to return instances of classes derived from `RegexBase`.

### Escape characters {: .exercise}

Modify the parser to handle escape characters,
so that (for example) `\*` is interpreted as "a literal asterisk"
and `\\` is interpreted as "a literal backslash".

### Lazy matching {: .exercise}

Modify the parser so that `*?` is interpreted as a single token
meaning "lazy match zero or more".

### Character sets {: .exercise}

Modify the parser so that expressions like `[xyz]` are interpreted to mean
"match any one of the characters x, y, or z".

### Back reference {: .exercise}

Modify the tokenizer so that it recognizes `\1`, `\2`, and so on to mean "back reference".
The number may contain any number of digits.

### Named groups {: .exercise}

1.  Modify the tokenizer to recognize named groups.
    For example, the named group `/(?<triple>aaa)/`
    would create a named group called `triple` that matches exactly three consecutive occurrences of 'a'.

2.  Write Mocha tests for your modified tokenizer.
    Does it handle nested named groups?

### Object streams {: .exercise}

Write a parser that turns files of key-value pairs separated by blank lines into objects.
For example, if the input is:

```txt
left: "left value"
first: 1

middle: "middle value"
second: 2

right: "right value"
third: 3
```

then the output will be:
{: .continue}

```js
[
  {left: "left value", first: 1},
  {middle: "middle value", second: 2},
  {right: "right value", third: 3}
]
```

Keys are always upper- and lower-case characters;
values may be strings in double quotes or unquoted numbers.

### Tokenize HTML {: .exercise}

1.  Write a tokenizer for a subset of HTML that consists of:

    -   Opening tags without attributes, such as `<div>` and `<p>`
    -   Closing tags, such as `</p>` and `</div>`
    -   Plain text between tags that does *not* contain '<' or '>' characters

2.  Modify the tokenizer to handle `key="value"` attributes in opening tags.

3.  Write Mocha tests for your tokenizer.

### The Shunting-Yard Algorithm {: .exercise}

1.  Use the [shunting-yard algorithm][shunting_yard_algorithm]
    to implement a tokenizer for a simple subset of arithmetic that includes:

    -   single-letter variable names
    -   single-digit numbers
    -   the `+`, `*`, and `^` operators, where `+` has the lowest precedence and `^` has the highest

2.  Write Mocha tests for your tokenizer.

### Handling errors {: .exercise}

1.  What does the regular expression tokenizer do
    with expressions that contain unmatched opening parentheses like `/a(b/`?
    What about expressions that contain unmatched closing parentheses like `/ab)/`?

2.  Modify it so it produces a more useful error message.
