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
including [% i "JSDoc" %][JSDoc][jsdoc][% /i %] and [% i "ESDoc" %][ESDoc][esdoc][% /i %].
This chapter will use what we learned in [% x code-generator %] about parsing source code
to build a simple documentation generator of our own.

## How can we extract documentation comments? {: #doc-generator-extract}

We will use [% i "Acorn" %][Acorn][acorn][% /i %] once again to parse our source files.
This time we will use the parser's `onComment` option,
giving it an array to fill in.
For the moment we won't bother to assign the [% i "abstract syntax tree" %]AST[% /i %] produced by parsing to a variable
because we are just interested in the comments:

[% excerpt file="extract-comments.js" %]

[% excerpt pat="two-kinds-of-comment.*" fill="js out" %]

There is more information here than we need,
so let's slim down the JSON that we extract:

[% excerpt file="extract-comments-subset.js" %]

[% excerpt pat="two-kinds-of-comment-subset.*" fill="sh out" %]

[% figure slug="doc-generator-comments" img="figures/comments.svg" alt="Line and block comments" caption="How line comments and block comments are distinguished and represented." %]

Acorn distinguishes two kinds of comments ([% f doc-generator-comments %]).
[% i "line comment" "comment!line" %][% g line_comment %]Line comments[% /g %][% /i %] cannot span multiple lines;
if one line comment occurs immediately after another,
Acorn reports two comments:

[% excerpt pat="multi-line-double-slash-comment.*" fill="js sh out" %]

[% i "block comment" "comment!block" %][% g block_comment %]Block comments[% /g %][% /i %],
on the other hand,
can span any number of lines.
We don't need to prefix each line with `*` but most people do for readability:

[% excerpt pat="multi-line-slash-star-comment.*" fill="js sh out" %]

By convention,
we use block comments that start with `/**` for documentation.
The first two characters are recognized by the parser as "start of comment",
so the first character in the extracted text is `*`:

[% excerpt pat="doc-comment.*" fill="js out" %]

## What input will we try to handle? {: #doc-generator-input}

We will use [% i "Markdown" %][Markdown][markdown][% /i %] for formatting our documentation.
The [% i "doc comment" "comment!doc" %][% g doc_comment %]doc comments[% /g %][% /i %] for function definitions look like this:

[% excerpt file="example-plain.js" %]

<!-- continue -->
while the ones for class definitions look like this:

[% excerpt file="util-plain.js" %]

The doc comments are unpleasant at the moment:
they repeat the function and method names from the code,
we have to create titles ourselves,
and we have to remember the back-quotes for formatting code.
We will fix some of these problems once we have a basic tool up and running.

The next step in doing that is to translate Markdown into HTML.
There are many [% i "Markdown!parser" %]Markdown parsers[% /i %] in JavaScript;
after experimenting with a few,
we decided to use [`markdown-it`][markdown-it]
along with the [`markdown-it-anchor`][markdown-it-anchor] extension
that creates HTML anchors for headings.
The main program gets all the doc comments from all of the input files,
converts the Markdown to HTML,
and displays that:

[% excerpt file="process-plain.js" keep="main" %]

To get all the comments
we extract comments from all the files,
remove the leading `*` characters (which aren't part of the documentation),
and then join the results after stripping off extraneous blanks:

[% excerpt file="process-plain.js" keep="getAllComments" %]

Extracting the comments from a single file is done as before:

[% excerpt file="process-plain.js" keep="extractComments" %]

<!-- continue -->
and removing the prefix `*` characters is a matter of splitting the text into lines,
removing the leading spaces and asterisks,
and putting the lines back together:

[% excerpt file="process-plain.js" keep="removePrefix" %]

One thing that isn't in this file (because we're going to use it in later versions)
is the function `slugify`.
A [% i "slug (unique identifier)" %][% g slug %]slug[% /g %][% /i %] is a short string that identifies a header or a web page;
the name comes from the era of newspapers,
where a slug was a short name used to identify an article while it was in production.
Our `slugify` function strips unnecessary characters out of a title,
adds hyphens,
and generally makes it something you might see in a URL:

[% excerpt file="slugify.js" %]

Let's run this generator and see what it produces
([% f doc-generator-process-plain %] and [% f doc-generator-mapping %]):

[% excerpt file="process-plain.sh" %]
[% excerpt file="process-plain.html" %]

[% figure slug="doc-generator-process-plain" img="figures/process-plain.svg" alt="Output of documentation generator" caption="The page produced by the documentation generator." %]

[% figure slug="doc-generator-mapping" img="figures/mapping.svg" alt="Mapping comments to documentation" caption="How comments in code map to documentation in HTML." %]

It works,
but there is a double `h1` header for each file (the filename and and the title comment),
the anchor IDs are hard to read,
there are no cross-references,
and so on.
Some of the visual issues can be resolved with [% i "CSS" %]CSS[% /i %],
and we can change our input format to make processing easier
as long as it also makes authoring easier.
However,
anything that is written twice will eventually be wrong in one place or another,
so our first priority is to remove duplication.

## How can we avoid duplicating names? {: #doc-generator-dup}

If a comment is the first thing in a file,
we want to use it as title text;
this will save us having to write an explicit level-1 title in a comment.
For each other comment,
we can extract the name of the function or method
from the node on the line immediately following the doc comment.
This allows us to write much tidier comments:

[% excerpt file="find-following-input.js" %]

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

[% excerpt file="find-following.js" keep="main" %]

The recursive search is straightforward as well---we delete line numbers from the target set
and add nodes to the [% i "Accumulator pattern" "design pattern!Accumulator" %][% g accumulator %]accumulator[% /g %][% /i %] as we find matches:

[% excerpt file="find-following.js" keep="findFollowing" %]

Finally,
we use a function called `condense` to get the name we want out of the AST we have:

[% excerpt file="find-following.js" keep="condense" %]

<!-- continue -->
We need this because we get a different structure with:

```js
const name = function() => {
}
```

<!-- continue -->
than we get with:
{: .break-before}

```js
function name() {
}
```

When we run this on our test case we get:

[% excerpt file="find-following.out" %]

We can use this to create better output ([% f doc-generator-fill-in-headers %]):

[% excerpt file="fill-in-headers.js" %]
[% excerpt file="fill-in-headers.html" %]

[% figure slug="doc-generator-fill-in-headers" img="figures/fill-in-headers.svg" alt="Filling in headers" caption="Filling in headers when generating documentation." %]

> ### Code is data
>
> We haven't made this point explicitly in a while,
> so we will repeat it here:
> [% i "code!as data" %]code is just another kind of data[% /i %],
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
> as the mathematician [% i "Whitehead, Alfred North" %]Alfred North Whitehead[% /i %] once wrote,
> "Civilization advances by extending the number of important operations which we can perform without thinking about them."

## Exercises {: #doc-generator-exercises}

### Building an index {: .exercise}

Modify the documentation generator to produce an alphabetical index of all classes and methods found.
Index entries should be hyperlinks to the documentation for the corresponding item.

### Documenting exceptions {: .exercise}

Extend the documentation generator to allow people to document the exceptions that a function throws.

### Deprecation warning {: .exercise}

Add a feature to the documentation generator
to allow authors to mark functions and methods as [% g deprecation %]deprecation[% /g %]
(i.e., to indicate that while they still exist,
they should not be used because they are being phased out).

### Usage examples {: .exercise}

Enhance the documentation generator so that
if a horizontal rule `---` appears in a documentation comment,
the text following is typeset as usage example.
(A doc comment may contain several usage examples.)

### Unit testing {: .exercise}

Write unit tests for the documentation generator using Mocha.

### Summarizing functions {: .exercise}

Modify the documentation generator so that line comments inside a function that use `//*`
are formatted as a bullet list in the documentation for that function.

### Cross referencing {: .exercise}

Modify the documentation generator so that
the documentation for one class or function
can include Markdown links to other classes or functions.

### Data types {: .exercise}

Modify the documentation generator to allow authors to define new data types
in the same way as [JSDoc][jsdoc].

### Inline parameter documentation {: .exercise}

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

### Tests as documentation {: .exercise}

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
