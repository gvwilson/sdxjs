---
---

-   Many programmers believe they're more likely to write documentation and keep it up to date
    if it's close to the code
-   Tools that extract specially-formatted comments from code and turn them into documentation
    have been around since the 1980s
-   Many are used for JavaScript, including [JSDoc][jsdoc] and [ESDoc][esdoc]
-   Good ones minimize the amount of duplicated information

## How can we extract documentation comments?

-   Use [Acorn][acorn] once again to extract comments
-   Provide an `onComment` option with an array value for it to fill in
    -   Don't bother assigning the AST produced by parsing to a variable because we're collecting side effects in `onComment`

<%- include('/_inc/file.html', {file: 'extract-comments.js'}) %>

<%- include('/_inc/multi.html', {pat: 'two-kinds-of-comment.*', fill: 'js out'}) %>

-   Extract a subset of the JSON with key features

<%- include('/_inc/file.html', {file: 'extract-comments-subset.js'}) %>

<%- include('/_inc/multi.html', {pat: 'two-kinds-of-comment-subset.*', fill: 'sh out'}) %>

-   Acorn distinguishes two kinds of comments
-   <g key="line_comment">Line comments</g> can't span multiple lines
    -   Consecutive line comments aren't combined

<%- include('/_inc/multi.html', {pat: 'multi-line-double-slash-comment.*', fill: 'js sh out'}) %>

-   <g key="block_comment">Block comments</g> can span any number of lines
    -   Don't need to prefix each line with `*` but most people do for readability

<%- include('/_inc/multi.html', {pat: 'multi-line-slash-star-comment.*', fill: 'js sh out'}) %>

-   By convention, use block comments that start with `/**` for documentation
    -   Which means the first character in the extracted text is `*`

<%- include('/_inc/multi.html', {pat: 'doc-comment.*', fill: 'js out'}) %>

## What input will we try to handle?

-   Use <g key="markdown">Markdown</g> for formatting
-   Parse it with [markdown-it][markdown-it]
-   Function definitions look like this:

<%- include('/_inc/file.html', {file: 'example-plain.js'}) %>

-   Class definitions look like this:

<%- include('/_inc/file.html', {file: 'util-plain.js'}) %>

-   Lots of unpleasantry here
    -   Repeating function and method names
    -   Have to remember the back-quotes for formatting code
    -   Have to create titles ourselves
-   But it's a start

## How can we extract and format comments?

-   Processing looks like this

<%- include('/_inc/file.html', {file: 'process-plain.js'}) %>

-   Extract all special comments from all files and concatenate
    with source file's name as level-1 heading
-   Convert that document from Markdown to HTML
    -   Use our own function `slugify` to give elements IDs
-   Run and inspect output

<%- include('/_inc/file.html', {file: 'process-plain.sh'}) %>
<%- include('/_inc/html.html', {file: 'process-plain.html'}) %>
<%- include('/_inc/page.html', {file: 'process-plain.html'}) %>

-   Lots of ugliness here
    -   Double `h1` for each file (filename and title comment)
    -   Anchor IDs are hard to read
    -   No cross-references
-   Some visual issues can be resolved with CSS
    -   And we can change our input format to make processing easier
    -   As long as it also makes authoring easier
-   But anything that's written twice will eventually be wrong in one place or another

## How can we avoid duplicating function names?

-   If a comment is the first thing in a file, use it as title text
    -   Saves us having to write an explicit level-1 title in a comment
-   For each other comment, find the node on the immediately following line
    -   Can't return immediately when we find a match because methods are nested in classes
    -   Delete the line number we're seeking so that we only find the first matching node
-   Allows us to write tidier comments

<%- include('/_inc/file.html', {file: 'find-following-input.js'}) %>

-   Extract and display information from nodes immediately following doc comments
    -   Find all block comments
    -   Record last line of each
    -   Recurse through AST to find code on line immediately following

<%- include('/_inc/multi.html', {pat: 'find-following.*', fill: 'js sh out'}) %>

-   Use this to create better output

<%- include('/_inc/file.html', {file: 'fill-in-headers.js'}) %>
<%- include('/_inc/html.html', {file: 'fill-in-headers.html'}) %>
<%- include('/_inc/page.html', {file: 'fill-in-headers.html'}) %>

<%- include('/_inc/problems.html') %>
