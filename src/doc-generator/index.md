---
template: page
title: "Documentation Generator"
lede: "Generating documentation from comments embedded in code"
---

Many programmers believe they're more likely to write documentation and keep it up to date
if it is close to the code.
Tools that extract specially-formatted comments from code and turn them into documentation
have been around since at least the 1980s;
many are used for JavaScript,
including <span i="JSDoc">[JSDoc][jsdoc]</span> and <span i="ESDoc">[ESDoc][esdoc]</span>.
This chapter will use what we learned in <a section="code-generator"/> about parsing source code
to build a simple documentation generator of our own.

## How can we extract documentation comments? {#doc-generator-extract}

We will use <span i="Acorn">[Acorn][acorn]</span> once again to parse our source files.
This time we will use the parser's `onComment` option,
giving it an array to fill in.
For the moment we won't bother to assign the <span i="abstract syntax tree">AST</span> produced by parsing to a variable
because we are just interested in the comments:

<div class="include" file="extract-comments.js" />

<div class="include" pat="two-kinds-of-comment.*" fill="js out" />

There is more information here than we need,
so let's slim down the JSON that we extract:

<div class="include" file="extract-comments-subset.js" />

<div class="include" pat="two-kinds-of-comment-subset.*" fill="sh out" />

<figure id="doc-generator-comments">
  <img src="figures/comments.svg" alt="Line and block comments" />
  <figcaption>How line comments and block comments are distinguished and represented.</figcaption>
</figure>

Acorn distinguishes two kinds of comments (<a figure="doc-generator-comments"/>).
<span g="line_comment" i="line comment; comment!line">Line comments</span> cannot span multiple lines;
if one line comment occurs immediately after another,
Acorn reports two comments:

<div class="include" pat="multi-line-double-slash-comment.*" fill="js sh out" />

<span g="block_comment" i="block comment; comment!block">Block comments</span>,
on the other hand,
can span any number of lines.
We don't need to prefix each line with `*` but most people do for readability:

<div class="include" pat="multi-line-slash-star-comment.*" fill="js sh out" />

By convention,
we use block comments that start with `/**` for documentation.
The first two characters are recognized by the parser as "start of comment",
so the first character in the extracted text is `*`:

<div class="include" pat="doc-comment.*" fill="js out" />

## What input will we try to handle? {#doc-generator-input}

We will use <span i="Markdown">[Markdown][markdown]</span> for formatting our documentation.
The <span g="doc_comment" i="doc comment; comment!doc">doc comments</span> for function definitions look like this:

<div class="include" file="example-plain.js" />

<!-- continue -->
while the ones for class definitions look like this:

<div class="include" file="util-plain.js" />

The doc comments are unpleasant at the moment:
they repeat the function and method names from the code,
we have to create titles ourselves,
and we have to remember the back-quotes for formatting code.
We will fix some of these problems once we have a basic tool up and running.

The next step in doing that is to translate Markdown into HTML.
There are many <span i="Markdown!parser">Markdown parsers</span> in JavaScript;
after experimenting with a few,
we decided to use [`markdown-it`][markdown-it]
along with the [`markdown-it-anchor`][markdown-it-anchor] extension
that creates HTML anchors for headings.
The main program gets all the doc comments from all of the input files,
converts the Markdown to HTML,
and displays that:

<div class="include" file="process-plain.js" keep="main" />

To get all the comments
we extract comments from all the files,
remove the leading `*` characters (which aren't part of the documentation),
and then join the results after stripping off extraneous blanks:

<div class="include" file="process-plain.js" keep="getAllComments" />

Extracting the comments from a single file is done as before:

<div class="include" file="process-plain.js" keep="extractComments" />

<!-- continue -->
and removing the prefix `*` characters is a matter of splitting the text into lines,
removing the leading spaces and asterisks,
and putting the lines back together:

<div class="include" file="process-plain.js" keep="removePrefix" />

One thing that isn't in this file (because we're going to use it in later versions)
is the function `slugify`.
A <span g="slug" i="slug (unique identifier)">slug</span> is a short string that identifies a header or a web page;
the name comes from the era of newspapers,
where a slug was a short name used to identify an article while it was in production.
Our `slugify` function strips unnecessary characters out of a title,
adds hyphens,
and generally makes it something you might see in a URL:

<div class="include" file="slugify.js" />

Let's run this generator and see what it produces
(<a figure="doc-generator-process-plain"/> and <a figure="doc-generator-mapping"/>):

<div class="include" file="process-plain.sh" />
<div class="include" file="process-plain.html" />

<figure id="doc-generator-process-plain">
  <img src="figures/process-plain.svg" alt="Output of documentation generator" />
  <figcaption>The page produced by the documentation generator.</figcaption>
</figure>

<figure id="doc-generator-mapping">
  <img src="figures/mapping.svg" alt="Mapping comments to documentation" />
  <figcaption>How comments in code map to documentation in HTML.</figcaption>
</figure>

It works,
but there is a double `h1` header for each file (the filename and and the title comment),
the anchor IDs are hard to read,
there are no cross-references,
and so on.
Some of the visual issues can be resolved with <span i="CSS">CSS</span>,
and we can change our input format to make processing easier
as long as it also makes authoring easier.
However,
anything that is written twice will eventually be wrong in one place or another,
so our first priority is to remove duplication.

## How can we avoid duplicating names? {#doc-generator-dup}

If a comment is the first thing in a file,
we want to use it as title text;
this will save us having to write an explicit level-1 title in a comment.
For each other comment,
we can extract the name of the function or method
from the node on the line immediately following the doc comment.
This allows us to write much tidier comments:

<div class="include" file="find-following-input.js" />

To extract and display information from nodes immediately following doc comments
we must find all the block comments,
record the last line of each,
and then search the AST to find nodes that are on lines
immediately following any of those trailing comment lines.
(We will assume for now that there are no blank lines between the comment
and the start of the class or function.)
The main program finds the comments as usual,
creates a set containing the line numbers we are looking for,
then searches for the nodes we want:

<div class="include" file="find-following.js" keep="main" />

The recursive search is straightforward as well---we delete line numbers from the target set
and add nodes to the <span g="accumulator" i="Accumulator pattern; design pattern!Accumulator">accumulator</span> as we find matches:

<div class="include" file="find-following.js" keep="findFollowing" />

Finally,
we use a function called `condense` to get the name we want out of the AST we have:

<div class="include" file="find-following.js" keep="condense" />

<!-- continue -->
We need this because we get a different structure with:

```js
const name = function() => {
}
```

<!-- continue -->
than we get with:

```js
function name() {
}
```

When we run this on our test case we get:

<div class="include" file="find-following.out" />

We can use this to create better output (<a figure="doc-generator-fill-in-headers"/>):

<div class="include" file="fill-in-headers.js" />
<div class="include" file="fill-in-headers.html" />

<figure id="doc-generator-fill-in-headers">
  <img src="figures/fill-in-headers.svg" alt="Filling in headers" />
  <figcaption>Filling in headers when generating documentation.</figcaption>
</figure>

> ### Code is data
>
> We haven't made this point explicitly in a while,
> so we will repeat it here:
> <span i="code!as data">code is just another kind of data</span>,
> and we can process it just like we would process any other data.
> Parsing code to produce an AST is no different from parsing HTML to produce DOM;
> in both cases we are simply transforming a textual representation that's easy for people to author
> into a data structure that's easy for a program to manipulate.
> Pulling things out of that data to create a report
> is no different from pulling numbers out of a hospital database to report monthly vaccination rates.
>
> Treating code as data enables us to do routine programming tasks with a single command,
> which in turn gives us more time to think about the tasks that we can't (yet) automate.
> Doing this is the foundation of a tool-based approach to software engineering;
> as the mathematician <span i="Whitehead, Alfred North">Alfred North Whitehead</span> once wrote,
> "Civilization advances by extending the number of important operations which we can perform without thinking about them."

## Exercises {#doc-generator-exercises}

### Building an index {.exercise}

Modify the documentation generator to produce an alphabetical index of all classes and methods found.
Index entries should be hyperlinks to the documentation for the corresponding item.

### Documenting exceptions {.exercise}

Extend the documentation generator to allow people to document the exceptions that a function throws.

### Deprecation warning {.exercise}

Add a feature to the documentation generator
to allow authors to mark functions and methods as <span g="deprecation">deprecation</span>
(i.e., to indicate that while they still exist,
they should not be used because they are being phased out).

### Usage examples {.exercise}

Enhance the documentation generator so that
if a horizontal rule `---` appears in a documentation comment,
the text following is typeset as usage example.
(A doc comment may contain several usage examples.)

### Unit testing {.exercise}

Write unit tests for the documentation generator using Mocha.

### Summarizing functions {.exercise}

Modify the documentation generator so that line comments inside a function that use `//*`
are formatted as a bullet list in the documentation for that function.

### Cross referencing {.exercise}

Modify the documentation generator so that
the documentation for one class or function
can include Markdown links to other classes or functions.

### Data types {.exercise}

Modify the documentation generator to allow authors to define new data types
in the same way as [JSDoc][jsdoc].

### Inline parameter documentation {.exercise}

Some documentation generators put the documentation for a parameter
on the same line as the parameter:

```js
/**
 * Transform data.
 */
function process(
  input,  /*- {stream} where to read */
  output, /*- {stream} where to write */
  op      /*- {Operation} what to do */
){
  // body would go here
}
```

<!-- continue -->
Modify the documentation generator to handle this.

### Tests as documentation {.exercise}

The [doctest][doctest] library for Python
allows programmers to embed unit tests as documentation in their programs.
Write a tool that:

1.  Finds functions that start with a block comment.

2.  Extracts the code and output from those blocks comments
    and turns them into assertions.

<!-- continue -->
For example, given this input:

```js
const findIncreasing = (values) => {
  /**
   * > findIncreasing([])
   * []
   * > findIncreasing([1])
   * [1]
   * > findIncreasing([1, 2])
   * [1, 2]
   * > findIncreasing([2, 1])
   * [2]
   */
}
```

<!-- continue -->
the tool would produce:

```js
assert.deepStrictEqual(findIncreasing([]), [])
assert.deepStrictEqual(findIncreasing([1]), [1])
assert.deepStrictEqual(findIncreasing([1, 2]), [1, 2])
assert.deepStrictEqual(findIncreasing([2, 1]), [2])
```
