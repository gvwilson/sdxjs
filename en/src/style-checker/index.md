---
title: "Style Checker"
---

Programmers argue endlessly about the best way to format their programs,
but everyone agrees that the most important thing is to be [%i "coding style!importance of consistency" %]consistent[%/i%]
[%b Binkley2012 Johnson2019 %].
Since checking rules by hand is tedious,
most programmers use tools to compare code against various rules and report any violations.
Programs that do this are often called [%i "linter" "coding style!linter" %][%g linter "linters" %][%/i%]
in honor of an early one for [%i "C" %]C[%/i%] named `lint`
(because it looked for fluff in source code).

In this chapter we will build a simple linter of our own inspired by [%i "ESLint" %][ESLint][eslint][%/i%],
which we use to check the code in this book.
Our tool will parse source code to create a data structure,
then go through that data structure and apply rules for each part of the program.
It will also introduce us to one of the key ideas of this book,
which is that source code is just another kind of data.

<div class="callout" markdown="1">

### Don't define your own style

Just as the world doesn't need more file format ([%x regex-parser %])
it also doesn't need more programming styles,
or more arguments among programmers about whether there should be spaces before curly braces or not.
[%i "Standard JS" %][Standard JS][standard_js][%/i%] may not do everything exactly the way you want,
but adopting it increases the odds that other programmers will be able to read your code at first glance.

</div>

## How can we parse JavaScript to create an AST? {: #style-checker-ast}

A parser for a simple language like arithmetic or JSON is relatively easy to write.
A parser for a language as complex as JavaScript is much more work,
so we will use one called [%i "Acorn" %][Acorn][acorn][%/i%] instead.
Acorn takes a string containing source code as input
and produces an [%i "abstract syntax tree" %][%g abstract_syntax_tree "abstract syntax tree" %][%/i%] (AST)
whose nodes store information about what's in the program
([%f style-checker-parse-tree %]).
An AST is for a program what the [%i "Document Object Model" %]DOM[%/i%] is for HTML:
an in-memory representation that is easy for software to inspect and manipulate.

ASTs can be quite complex---for example,
the JSON representation of the AST for a single constant declaration
is [% linecount parse-single-const.out %] lines long:

[% inc pat="parse-single-const.*" fill="js slice.out" %]

[% figure
   cls="figure-here"
   slug="style-checker-parse-tree"
   img="parse-tree.svg"
   alt="A small parse tree"
   caption="The parse tree of a simple program."
%]

Acorn's output is in [%i "Esprima format" %][Esprima][esprima] format[%/i%]
(so-called because it was originally defined by a tool with that name).
The format's specification is very detailed,
but we can usually figure out most of what we need by inspection.
For example,
here is the output for a [% linecount parse-const-func.js %]-line program:

[% inc pat="parse-const-func.*" fill="js slice.out" %]

Yes, it really is almost 500 lines long…
{: .continue}

## How can we find things in an AST? {: #style-checker-search}

If we want to find functions, variables, or anything else in an AST
we need to [%i "walk a tree" %][%g walk_tree "walk the tree" %][%/i%],
i.e.,
to visit each node in turn.
The [`acorn-walk`][acorn_walk] library will do this for us
using the [%i "Visitor pattern" "design pattern!Visitor" %]Visitor design pattern[%/i%] we first saw in [%x page-templates %].
If we provide a function to act on nodes of type `Identifier`,
`acorn-walk` will call that function each time it finds an identifier.
We can use other options to say that we want to record the locations of nodes (i.e., their line numbers)
and to collect comments in an array called `onComment`.
Our function can do whatever we want;
for demonstration purposes we will add nodes to an array called `state`
and report them all at the end
([%f style-checker-walk-tree %]).

[% inc pat="walk-ast.*" fill="js out" %]

<div class="callout" markdown="1">

### There's more than one way to do it

`walk.simple` takes four arguments:

1.  The root node of the AST, which is used as the starting point.

2.  An object containing callback functions for handling various kinds of nodes.

3.  Another object that specifies what algorithm to use---we have set this to `null`
    to use the default because
    we don't particularly care about the order in which the nodes are processed.

4.  Something we want passed in to each of the node handlers,
    which in our case is the `state` array.
    If our node handling functions don't require any extra data
    from one call to the next
    we can leave this out;
    if we want to accumulate information across calls,
    this argument acts as the Visitor's memory.

Any general-purpose implementation of the Visitor pattern
is going to need these four things,
but as we will see below,
we can implement them in different ways.
{: .continue}

</div>

[% figure
   cls="figure-here"
   slug="style-checker-walk-tree"
   img="walk-tree.svg"
   alt="Walking a tree"
   caption="Walking a tree to perform an operation at each node."
%]

## How can we apply checks? {: #style-checker-apply}

We don't just want to collect nodes:
we want to check their properties against a set of rules.
One way to do this would be to call `walk.simple` once for each rule,
passing it a function that checks just that rule.
Another way---the one we'll use---is to write a [%i "software design!generic function" %]generic function[%/i%]
that checks a rule and records any nodes that don't satisfy it,
and then call that function once for each rule inside our `Identifier` handler.
This may seem like extra work,
but it ensures that all of our rule-checkers store their results in the same way,
which in turn means that we can write one reporting function
and be sure it will handle everything.

The function  `applyCheck` takes the current state (where we are accumulating rule violations),
a label that identifies this rule (so that violations of it can be stored together),
the node,
and a logical value telling it whether the node passed the test or not.
If the node failed the test
we make sure that `state` contains a list with the appropriate label
and then append this node to it.
This "create storage space on demand" pattern
is widely used but doesn't have a well-known name.

[% inc file="check-name-lengths.js" keep="applyCheck" %]

We can now put a call to `applyCheck` inside the handler for `Identifier`:

[% inc file="check-name-lengths.js" keep="main" %]

We can't just use `applyCheck` as the handler for `Identifier`
because `walk.simple` wouldn't know how to call it.
This is a (very simple) example of the [%i "Adapter pattern" "design pattern!Adapter" %][%g adapter_pattern "Adapter" %][%/i%] design pattern:
we write a function or class to connect the code we want to call
to the already-written code that is going to call it.
{: .continue}

The output for the same sample program as before is:

[% inc file="check-name-lengths.out" %]

The exercises will ask why the parameter `x` doesn't show up
as a violation of our rule
that variables' names must be at least four characters long.
{: .continue}

## How does the AST walker work? {: #style-checker-walker}

The AST walker uses the Visitor pattern,
but how does it actually work?
We can build our own by defining a class with methods that walk the tree,
take action depending on the kind of node,
and then go through the children of that node (if any).
The user can then derive a class of their own from this
and override the set of action methods they're interested in.

One key difference between our implementation and `acorn-walk`'s is that
our methods don't need to take `state` as a parameter
because it's contained in the object that they're part of.
That simplifies the methods---one less parameter---but it does mean that
anyone who wants to use our visitor has to derive a class,
which is a bit more complicated than writing a function.
This tradeoff is a sign that managing state is part of the problem's
[%i "intrinsic complexity" %][%g intrinsic_complexity "intrinsic complexity" %][%/i%]:
we can move it around,
but we can't get rid of it.

The other difference between our visitor and `acorn-walk` is that
our class uses [%i "dynamic lookup" %][%g dynamic_lookup "dynamic lookup" %][%/i%]
(a form of [%i "introspection!of methods" %]introspection[%/i%])
to look up a method
with the same name as the node type in the object.
While we normally refer to a particular method of an object using `object.method`,
we can also look them up by asking for `object[name]`
in the same way that we would look up any other property of any other object.
Our completed class looks like this:

[% inc file="walker-class.js" keep="walker" %]

The code we need to use it is:
{: .continue}

[% inc file="walker-class.js" omit="walker" %]

and its output is:
{: .continue}

[% inc file="walker-class.out" %]

We think this approach to implementing the Visitor pattern is easier to understand and extend
than one that relies on callbacks,
but that could just be a reflection of our background and experience.
As with code style,
the most important thing is consistency:
if we implement Visitor using classes in one place,
we should implement it that way everywhere.

## How else could the AST walker work? {: #style-checker-alternatives}

A third approach to this problem uses
the [%i "Iterator pattern" "design pattern!Iterator" %][%g iterator_pattern "Iterator" %][%/i%] design pattern.
Instead of taking the computation to the nodes,
an iterator returns the elements of a structure for processing
([%f style-checker-iterator %]).
One way to think about it is that Visitor encapsulates recursion,
while Iterator turns everything into a loop.

We can implement the Iterator pattern in JavaScript using
[%i "generator function" "Iterator pattern!generator function" %][%g generator_function "generator functions" %][%/i%].
If we declare a function using `function *` (with an asterisk) instead of `function`
then we can use the `yield` keyword to return a value and suspend processing to be resumed later.
The result of `yield` is a two-part structure with a value and a flag showing whether or not processing is done:

[% inc pat="generator-example.*" fill="js out" %]

[% figure
   cls="figure-here"
   slug="style-checker-iterator"
   img="iterator.svg"
   alt="The Iterator pattern"
   caption="Finding nodes in the tree using the Iterator pattern."
%]

As another example,
this generator takes a string and produces its vowels one by one:

[% inc pat="generator-vowels-while.*" fill="js out" %]

A generator function doesn't actually generate anything;
instead,
it creates an object that we can then ask for values repeatedly.
This gives us a way to have several generators in play at the same time.
{: .continue}

Instead of a `while` loop it is much more common to use `for...of`,
which knows how to work with generators:

[% inc file="generator-vowels-for.js" keep="loop" %]

Finally,
just as `function *` says "this function is a generator",
`yield *` says "yield the values from a nested generator one by one".
We can use it to walk irregular structures like nested arrays:

[% inc file="generator-tree.js" %]

Let's use generators to count the number of expressions of various types in a program.
The generator function that visits each node is:

[% inc file="generator-count.js" keep="generator" %]

and the program that uses it is:
{: .continue}

[% inc file="generator-count.js" keep="main" %]

When we run it with our usual test program as input, we get:

[% inc file="generator-count.out" %]

Generators are a clean solution to many hard problems,
but we find it more difficult to check variable identifiers using generators
than using the class-based Visitor approach
because we want to accumulate violations to report later.
Again,
this could be a reflection of what we're used to rather than anything intrinsic;
as with coding style,
the most important thing is to be consistent.

## What other kinds of analysis can we do? {: #style-checker-analysis}

As one final example,
consider the problem of keeping track of which methods are defined where
in a deeply nested class hierarchy.
(This problem comes up in some of the later chapters in this book:
we wrote so many classes that incrementally extended their predecessors for pedagogical purposes
that we lost track of what was defined where.)
To create a table of method definitions,
we first need to find the ancestors of the last class in the hierarchy:

[% inc file="find-ancestors.js" omit="skip" %]

Finding class definitions is a straightforward extension of what we have already done:

<div class="pagebreak"></div>
[% inc file="find-ancestors.js" keep="findClassDef" %]

To test this code, we start with the last of these three short files:

[% inc pat="*.js" fill="upper middle lower" %]
[% inc file="run-find-ancestors.out" %]

Good: we can recover the [%i "chain of inheritance" %]chain of inheritance[%/i%].
Finding method definitions is also straightforward:

[% inc file="find-methods.js" %]

And finally,
we can print a [%i "Markdown" %][%g markdown "Markdown" %][%/i%]-formatted table
showing which methods are defined in which class:

[% inc file="run-find-methods.raw.out" %]

which renders as:
{: .continue}

| method | Upper | Middle | Lower |
| ---- | ---- | ---- | ---- |
| additional | . | . | X |
| constructor | X | X | . |
| modify | X | X | . |
| report | X | . | X |

This may seem rather pointless for our toy example,
but it proves its worth when we are looking at something like
the virtual machine we will build in [%x virtual-machine %],
which has a more complex method definition table:

| method | Base | Interactive | Test | Exit |
| ---- | ---- | ---- | ---- | ---- |
| clear | . | X | . | . |
| constructor | X | X | X | . |
| exit | . | X | . | X |
| getCommand | . | X | . | . |
| handle | . | X | . | . |
| help | . | X | . | . |
| input | . | X | X | . |
| interact | . | X | . | . |
| list | . | X | . | . |
| message | X | . | X | . |
| next | . | X | . | . |
| print | . | X | . | . |
| run | . | X | . | . |
| setTester | . | . | X | . |
| setVM | X | . | . | . |
| stop | . | X | . | . |
| variables | . | X | . | . |

## Exercises {: #style-checker-exercises}

### Function length {: .exercise}

Derive a class from `Walker` that reports the length in lines of each function defined in the code being checked.

### Expression depth {: .exercise}

Derive a class from `Walker` that reports how deep each top-level expression in the source code is.
For example,
the depth of `1 + 2 * 3` is 2,
while the depth of `max(1 + 2 + 3)` is 3
(one level for the function call, one for the first addition, and one for the nested addition).

### Downward and upward {: .exercise}

Modify `Walker` so that users can specify
one action to take at a node on the way down the tree
and a separate action to take on the way up.
(Hint: require users to specify `Nodename_downward` and/or `Nodename_upward` methods in their class,
then use string concatenation to construct method names while traversing the tree.)

### Aggregating across files {: .exercise}

Create a command-line program called `sniff.js`
that checks for style violations in any number of source files.
The first command-line argument to `sniff.js` must be a JavaScript source file
that exports a class derived from `Walker` called `Check`
that implements the checks the user wants.
The other command-line arguments must be the names of JavaScript source files to be checked:

[% inc file="x-across-files/sniff.sh" %]

### Finding assertions {: .exercise}

Write a program `find-assertions.js` that finds all calls to `assert` or `assert.something`
and prints the assertion message (if any).

### Finding a missing parameter {: .exercise}

1.  Why doesn't the parameter `x` show up as a rule violation
    in the example where we check name lengths?

2.  Modify the example so that it does.

### Finding nested indexes {: .exercise}

Write a tool that finds places where nested indexing is used,
i.e.,
where the program contains expressions like `arr[table[i]]`.

### Dynamic lookup {: .exercise}

1.  Write a function `dynamicExecution` that takes an object,
    the name of a method,
    and zero or more parameters as arguments
    and calls that method on that object:

    ```js
    dynamicExecution(obj, 'meth', 1, 'a')
    // same as obj.meth(1, 'a')
    ```

2.  What *doesn't* this work for?

### Generators and arrays {: .exercise}

1.  Write a generator that takes a two-dimensional table represented as an array of arrays
    and returns the values in [%g column_major "column-major" %] order.

2.  Write another generator that takes a similar table
    and returns the values in [%g row_major "row-major" %] order.

### Generators and identifiers {: .exercise}

Rewrite the tool to check identifier lengths using a generator.

