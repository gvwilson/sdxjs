---
---

Many programmers believe they're more likely to write documentation and keep it up to date
if it is close to the code.
Tools that extract specially-formatted comments from code and turn them into documentation
have been around since the 1980s;
many are used for JavaScript,
including [JSDoc][jsdoc] and [ESDoc][esdoc]
(which we use to document the tools that build this book).
This chapter will use what we now know about parsing source code
to build a simple documentation generator of our own.

## How can we extract documentation comments?

Once again we will use [Acorn][acorn] to extract comments
by providing an `onComment` option to the parser
with an array for it to fill in.
For the moment we won't bother to assign the AST produced by parsing to a variable
because we are just interested in the comments:

<%- include('/inc/file.html', {file: 'extract-comments.js'}) %>

<%- include('/inc/multi.html', {pat: 'two-kinds-of-comment.*', fill: 'js out'}) %>

There is more information here than we need,
so let's slim down the JSON that we extract:

<%- include('/inc/file.html', {file: 'extract-comments-subset.js'}) %>

<%- include('/inc/multi.html', {pat: 'two-kinds-of-comment-subset.*', fill: 'sh out'}) %>

[Acorn][acorn] distinguishes two kinds of comments.
<g key="line_comment">Line comments</g> cannot span multiple lines;
if one line comment occurs immediately after another,
[Acorn][acorn] reports two comments
(<f key="doc-generator-comments"></f>):

<%- include('/inc/multi.html', {pat: 'multi-line-double-slash-comment.*', fill: 'js sh out'}) %>

<%- include('/inc/figure.html', {
    id: 'doc-generator-comments',
    img: '/static/tools-small.jpg',
    alt: 'Line and block comments',
    cap: 'How line comments and block comments are distinguished and represented.',
    fixme: true
}) %>

<g key="block_comment">Block comments</g>,
on the other hand,
can span any number of lines.
We don't need to prefix each line with `*` but most people do for readability:

<%- include('/inc/multi.html', {pat: 'multi-line-slash-star-comment.*', fill: 'js sh out'}) %>

By convention,
we use block comments that start with `/**` for documentation.
The first two characters are recognized by the parser as "start of comment",
so the first character in the extracted text is `*`:

<%- include('/inc/multi.html', {pat: 'doc-comment.*', fill: 'js out'}) %>

## What input will we try to handle?

We will use [Markdown][markdown] for formatting our documentation.
The documentation for function definitions looks like this:

<%- include('/inc/file.html', {file: 'example-plain.js'}) %>

::: continue
while the documentation for class definitions looks like this:
:::

<%- include('/inc/file.html', {file: 'util-plain.js'}) %>

The embedded comments are rather unpleasant at the moment:
the function and method names from the code are repeated in the <g key="doc_comment">doc comments</g>,
we have to create titles ourselves,
and we have to remember the back-quotes for formatting code.
We will fix some of these problems once we have a basic tool up and running.

There are many [Markdown][markdown] parsers in JavaScript;
after a bit of experimentation,
we decided to use [`markdown-it`][markdown-it]
along with the [`markdown-it-anchor`][markdown-it-anchor] extension
that creates HTML anchors for headings.
The main program gets all the doc comments from all of the input files,
converts the Markdown to HTML,
and displays that:

<%- include('/inc/keep.html', {file: 'process-plain.js', key: 'main'}) %>

To get all the comments
we extract comments from all the files,
remove the leading `*` characters (which aren't part of the documentation),
and then join up the results after stripping off extraneous blanks:

<%- include('/inc/keep.html', {file: 'process-plain.js', key: 'getAllComments'}) %>

Extracting the comments from a single file is done as before:

<%- include('/inc/keep.html', {file: 'process-plain.js', key: 'extractComments'}) %>

::: continue
and removing the prefix `*` characters is a matter of splitting the text into lines,
removing the leading spaces and asterisks,
and putting the lines back together:
:::

<%- include('/inc/keep.html', {file: 'process-plain.js', key: 'removePrefix'}) %>

One thing that isn't in this file (because we're going to use it in later versions)
is the function `slugify`.
A <g key="slug">slug</g> is a short string that identifies a header or a web page;
the name comes from the era of newspapers,
where a slug was a short name used to identify an article while it was in production.
Our `slugify` function strips unnecessary characters out of a title,
adds hyphens,
and generally makes it something you might see in a URL:

<%- include('/inc/file.html', {file: 'slugify.js'}) %>

Let's run the first version of our documentation generator
and see what it produces
(<f key="doc-generator-mapping"></f>):

<%- include('/inc/file.html', {file: 'process-plain.sh'}) %>
<%- include('/inc/html.html', {file: 'process-plain.html'}) %>
<%- include('/inc/page.html', {file: 'process-plain.html'}) %>

<%- include('/inc/figure.html', {
    id: 'doc-generator-mapping',
    img: '/static/tools-small.jpg',
    alt: 'Mapping comments to documentation',
    cap: 'How comments in code map to documentation in HTML.',
    fixme: true
}) %>

Again,
there is a lot of room for improvement:
there is a double `h1` header for each file (the filename and and the title comment),
the anchor IDs are hard to read,
there are no cross-references,
and so on.
Some of the visual issues can be resolved with CSS,
and we can change our input format to make processing easier
as long as it also makes authoring easier.
However,
anything that is written twice will eventually be wrong in one place or another,
so our first priority is to remove duplication.

## How can we avoid duplicating function names?

If a comment is the first thing in a file,
we want to use it as title text;
this will save us having to write an explicit level-1 title in a comment.
For each other comment,
we can extract the name of the function or method
from the node on the line immediately following the doc comment.
This allows us to write much tidier comments:

<%- include('/inc/file.html', {file: 'find-following-input.js'}) %>

To extract and display information from nodes immediately following doc comments
we must find all the block comments,
record the last line of each,
and then recurse through the AST to find the node on line immediately following
any of those last comment lines.
The main program finds the comments as usual,
creates a set containing the line numbers we are looking for,
then searches for the nodes we want:

<%- include('/inc/keep.html', {file: 'find-following.js', key: 'main'}) %>

The recursive search is straightforward as well---the only new trick is that
we delete line numbers from the target set
and add nodes to the <g key="accumulator">accumulator</g> as we find matches:

<%- include('/inc/keep.html', {file: 'find-following.js', key: 'findFollowing'}) %>

Finally,
we use a function called `condense` to get the name we want out of the AST we have:

<%- include('/inc/keep.html', {file: 'find-following.js', key: 'condense'}) %>

::: continue
We need this because we get a different structure with:
:::

```js
const name = function() => {
}
```

::: continue
than we get with:
:::

```js
function name() {
}
```

When we run this on our test case we get:

<%- include('/inc/file.html', {file: 'find-following.out'}) %>

We can use this to create better output:

<%- include('/inc/file.html', {file: 'fill-in-headers.js'}) %>
<%- include('/inc/html.html', {file: 'fill-in-headers.html'}) %>
<%- include('/inc/page.html', {file: 'fill-in-headers.html'}) %>
