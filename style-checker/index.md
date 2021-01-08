---
---

Programmers argue endlessly about the best way to format their programs,
but (almost) everyone agrees that the most important thing is to be consistent.
Since checking rules by hand is tedious,
most programmers rely on tools that compare code against various rules
and report any violations.
Tools like this are called <g key="linter">linters</g>
in honor of an early one for C named `lint`
because it looked for fluff in source code.

In this chapter we will build a linter of our own inspired by [ESLint][eslint]
(which we use to check the code in this book).
Our tool will parse source code to create a data structure,
then go through that data structure and apply rules for each part of the program.
It will also introduce us to one of the key ideas of this book,
which is that source code is just another kind of data.

## How can we parse JavaScript to create an AST?

A parser for a simple language like arithmetic or JSON is relatively easy to write (<x key="regex-parser"></x>).
A parser for a language as complex as JavaScript is much more work,
so we will use one called [Acorn][acorn] instead.
[Acorn][acorn] takes source code as input
and produces an <g key="abstract_syntax_tree">abstract syntax tree</g> (AST)
whose nodes store information about what's in the program
(<f key="style-checker-parse-tree"></f>).
ASTs can be quite complex---for exmaple,
the JSON representation of the AST for a single constant declaration
is <%- include('/inc/linecount.html', {file: 'parse-single-const.out'}) %> lines long:

<%- include('/inc/multi.html', {pat: 'parse-single-const.*', fill: 'js slice.out'}) %>

<%- include('/inc/fig.html', {
    id: 'style-checker-parse-tree',
    img: '/static/tools-small.jpg',
    alt: 'A small parse tree',
    cap: 'The parse tree of a simple program.',
    fixme: true
}) %>

[Acorn][acorn]'s output is in [Esprima][esprima] format.
The specification is very detailed,
but we can usually figure out most of what we need by inspection.
For example,
here's the output for a <%- include('/inc/linecount.html', {file: 'parse-const-func.js'}) %>-line program:

<%- include('/inc/multi.html', {pat: 'parse-const-func.*', fill: 'js slice.out'}) %>

## How can we find things in an AST?

If we want to find functions, variables, or anything else in an AST
we need to <g key="walk_tree">walk the tree</g>,
i.e.,
to visit each node in turn.
The [`acorn-walk`][acorn-walk] library will do this for us.
We provide a function to act on nodes of type `Identifier`
and use options to say that we want to record locations
and to collect comments in the array `onComment`.
Our function can do whatever we want,
so for demonstration purposes we create an array called `state` to record declaration nodes as they're found
and then report them all at the end
(<f key="style-checker-walk-tree"></f>).

<%- include('/inc/fig.html', {
    id: 'style-checker-walk-tree',
    img: '/static/tools-small.jpg',
    alt: 'Walking a tree',
    cap: 'Walking a tree to perform an operation at each node.',
    fixme: true
}) %>

<%- include('/inc/multi.html', {pat: 'walk-ast.*', fill: 'js out'}) %>

## How can we apply checks?

We don't just want to collect nodes:
we want to check their properties.
A little function called `applyCheck` accumulates results on demand,
building up a collection of lists:

<%- include('/inc/keep.html', {file: 'check-name-lengths.js', key: 'applyCheck'}) %>

Using this, our main program is:

<%- include('/inc/keep.html', {file: 'check-name-lengths.js', key: 'main'}) %>

::: continue
and the output for the same sample program as before is:
:::

<%- include('/inc/file.html', {file: 'check-name-lengths.out'}) %>

The exercises will ask why the parameter `x` doesn't show up as a violation of our rule
that variables' names must be at least four characters long.

## How does the AST walker work?

The AST walker uses the Visitor pattern first seen in <x key="page-templates"></x>.
We can build our own by defining a class with methods that walk the tree,
take action depending on the kind of node,
and then go through the children of that node (if any).
The user can then derive a class of their own from this
and override the set of action methods they're interested in.

The key difference between our visitor and `acorn-walk` is that
our class uses <g key="dynamic_lookup">dynamic lookup</g> to look up a method
with the same name as the node type in the object.
While we normally refer to a particular method of an object using `object.method`,
we can also look them up by asking for `object[name]`
where `name` is a variable or expression that produces a string.
We think this approach to implementing the Visitor pattern is easier to understand and extend
than one that relies on callbacks,
but that's a reflection of our background and experience
rather than intrinsic to the code itself.

Our class looks like this:

<%- include('/inc/keep.html', {file: 'walker-class.js', key: 'walker'}) %>

The code we need to use it is:

<%- include('/inc/erase.html', {file: 'walker-class.js', key: 'walker'}) %>

::: continue
and its output is:
:::

<%- include('/inc/file.html', {file: 'walker-class.out'}) %>

## How else could the AST walker work?

Yet another approach to this problem uses the <g key="iterator_pattern">Iterator</g> pattern.
Instead of taking the computation to the nodes as a visitor does,
an iterator returns the elements of a complex structure one by one for processing
(<f key="style-checker-iterator"></f>).
One way to think about it is that the Visitor pattern encapsulates recursion,
while the Iterator pattern turns everything into a `for` loop.

<%- include('/inc/fig.html', {
    id: 'style-checker-iterator',
    img: '/static/tools-small.jpg',
    alt: 'The Iterator pattern',
    cap: 'Finding nodes in the tree using the Iterator pattern.',
    fixme: true
}) %>

We can implement the Iterator pattern in JavaScript using <g key="generator_function">generator functions</g>.
If we declare a function using `function *` rather than just `function`
then we can use the `yield` keyword to return a value and suspend processing to be resumed later.
The result of `yield` is a two-part structure with a value and a flag showing whether or not processing is done:

<%- include('/inc/multi.html', {pat: 'generator-example.*', fill: 'js out'}) %>

::: continue
It's important to note that a generator function creates an object
that we can then ask for values repeatedly.
This gives us a way to have several generators in play at the same time.
:::

This generator takes an irregular nested array of strings
and yields a string and another generator
(using `yield*` to mean "uses its values until they run out"):

<%- include('/inc/file.html', {file: 'generator-tree.js'}) %>

We can manage iteration explicitly:

<%- include('/inc/multi.html', {pat: 'generator-tree-while.*', fill: 'js out'}) %>

::: continue
but `for…of` knows how to work with generators,
and is the usual way to manage them:
:::

<%- include('/inc/multi.html', {pat: 'generator-tree-for.*', fill: 'js out'}) %>

Let's use this to count the number of expressions of various types in a program.
The generator function that visits each node is:

<%- include('/inc/keep.html', {file: 'generator-count.js', key: 'generator'}) %>

::: continue
and the program that uses it is:
:::

<%- include('/inc/keep.html', {file: 'generator-count.js', key: 'main'}) %>

When we run it with our usual test program as input, we get:

<%- include('/inc/file.html', {file: 'generator-count.out'}) %>

Generators are a clean solution to many hard problems,
but since we have to maintain state ourselves,
we find it more difficult to check variable identifiers using generators
than using the class-based Visitor approach.
Again,
this could be a reflection of what we're used to rather than anything intrinsic;
as with coding style,
the most important thing is to be consistent.

## What other kinds of analysis can we do?

As one final example,
consider the problem of keeping trac of which methods are defined where
in a deeply-nested class hierarchy.
(This problem came up in some of the later chapters in this book:
we wrote so many classes that incrementally extended their predecessors for pedagogical purposes
that we lost track of what was defined where.)
To create a table of method definitions,
we first need to find the ancestors of the last class in the hierarchy:

<%- include('/inc/erase.html', {file: 'find-ancestors.js', key: 'skip'}) %>

Finding class definitions is a straightforward extension of what we have already done:

<%- include('/inc/keep.html', {file: 'find-ancestors.js', key: 'findClassDef'}) %>

To test this, we start with the last of these three short files:

<%- include('/inc/multi.html', {pat: '*.js', fill: 'upper middle lower'}) %>
<%- include('/inc/file.html', {file: 'run-find-ancestors.out'}) %>

Good: we can recover the chain of inheritance.
Finding method definitions is also straightforward:

<%- include('/inc/file.html', {file: 'find-methods.js'}) %>

And finally,
we can print a <g key="markdown">Markdown</g>-formatted table showing which methods are defined in which class:

<%- include('/inc/raw.html', {file: 'run-find-methods.raw.out'}) %>

This may seem rather pointless for our toy example,
but it proves its worth when we are looking at something like
the virtual machine we will build in <x key="virtual-machine"></x>:

<%- include('/inc/raw.html', {file: 'find-debugger-methods.raw.out'}) %>
