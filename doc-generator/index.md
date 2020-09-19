---
---

-   Extract specially-formatted comments from code
    and generate documentation for the package like [ESDoc][esdoc].

## How can we extract documentation comments?

-   Use [Acorn][acorn] once again to extract comments
    -   Provide an `onComment` option with an array value
-   Test it out

<%- include('/_inc/code.html', {file: 'extract-comments.js'}) %>

<%- include('/_inc/multi.html', {pat: 'two-kinds-of-comment.*', fill: 'js text'}) %>

-   Show a subset of JSON going forward

<%- include('/_inc/code.html', {file: 'extract-comments-subset.js'}) %>

<%- include('/_inc/multi.html', {pat: 'two-kinds-of-comment-subset.*', fill: 'sh text'}) %>

-   <g key="line_comment">Line comments</g> can't span multiple lines
    -   Consecutive line comments aren't combined

<%- include('/_inc/multi.html', {pat: 'multi-line-double-slash-comment.*', fill: 'js sh text'}) %>

-   A <g key="block_comment">block comment</g> can span any number of lines
    -   Don't need to prefix each line with `*` but most people do for readability

<%- include('/_inc/multi.html', {pat: 'multi-line-slash-star-comment.*', fill: 'js sh text'}) %>

-   Could extract all block comments and use those for docs
-   By convention, look for comments that start with `/**`
    -   Which means the first character in the extracted text is `*`

<%- include('/_inc/multi.html', {pat: 'doc-comment.*', fill: 'js text'}) %>

## What input will we try to handle?

-   Use [GitHub Flavored Markdown][gfm] with a few conventions
-   Use [marked.js][marked] for parsing
-   Function definitions look like this:

<%- include('/_inc/code.html', {file: 'example-01.js'}) %>

-   Class definitions look like this:

<%- include('/_inc/code.html', {file: 'util-01.js'}) %>

-   Lots of ugliness here
    -   Repeating function and method names
    -   Have to remember the back-quotes for formatting code
-   But some good ideas
    -   A link to `#` should turn into a cross-reference

## How can we extract and format comments?

-   Processing looks like this

<%- include('/_inc/multi.html', {pat: 'extract-and-format.*', fill: 'js sh'}) %>
<%- include('/_inc/html.html', {file: 'extract-and-format.html'}) %>

-   Lots of ugliness here
    -   Double `h1` for each file (filename and title comment)
    -   Anchor IDs include full comments
    -   Cross-references don't resolve
    -   No links to (lines in) source files
-   Some visual issues can be resolved with CSS
-   Remember: we can change our input format to make processing easier
    -   As long as it also makes authoring easier

## How can we avoid duplicating function names?

-   If a comment is the first thing in a file, use it as title text
    -   No heading marker required
-   For each other comment, find the node on the immediately following line
    -   Can't return immediately when we find a match because methods are nested in classes
    -   Delete the line number we're seeking so that we only find the first matching node
-   Test case with one instance of each type of function

<%- include('/_inc/code.html', {file: 'find-following-input.js'}) %>

-   Extract and display information from nodes immediately following doc comments

<%- include('/_inc/multi.html', {pat: 'find-following.*', fill: 'js sh text'}) %>

-   Use this to create better output

<%- include('/_inc/code.html', {file: 'fill-in-headers.js'}) %>
<%- include('/_inc/html.html', {file: 'fill-in-headers.html'}) %>
