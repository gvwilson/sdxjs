---
---

-   Extract specially-formatted comments from code
    and generate documentation for the package like [ESDoc][esdoc].

## How can we extract documentation comments? {#extracting}

-   Use [Acorn][acorn] once again to extract comments
    -   Provide an `onComment` option with an array value
-   Test it out

{% include file.md file="extract-comments.js" %}

{% include wildcard.md pattern="two-kinds-of-comment.*" values="js,text" %}

-   Show a subset of JSON going forward

{% include file.md file="extract-comments-subset.js" %}

{% include wildcard.md pattern="two-kinds-of-comment-subset.*" values="sh,text" %}

-   [Line comments][line-comment] can't span multiple lines
    -   Consecutive line comments aren't combined

{% include wildcard.md pattern="multi-line-double-slash-comment.*" values="js,sh,text" %}

-   A [block comment][block-comment] can span any number of lines
    -   Don't need to prefix each line with `*` but most people do for readability

{% include wildcard.md pattern="multi-line-slash-star-comment.*" values="js,sh,text" %}

-   Could extract all block comments and use those for docs
-   By convention, look for comments that start with `/**`
    -   Which means the first character in the extracted text is `*`

{% include wildcard.md pattern="doc-comment.*" values="js,text" %}

## What input will we try to handle? {#input}

-   Use [GitHub Flavored Markdown][gfm] with a few conventions
-   Use [marked.js][marked] for parsing
-   Function definitions look like this:

{% include file.md file="example-01.js" %}

-   Class definitions look like this:

{% include file.md file="util-01.js" %}

-   Lots of ugliness here
    -   Repeating function and method names
    -   Have to remember the back-quotes for formatting code
-   But some good ideas
    -   A link to `#` should turn into a cross-reference

## How can we extract and format comments? {#formatting}

-   Processing looks like this

{% include wildcard.md pattern="extract-and-format.*" values="js,sh" %}
{% include html.html file="extract-and-format.html" %}

-   Lots of ugliness here
    -   Double `h1` for each file (filename and title comment)
    -   Anchor IDs include full comments
    -   Cross-references don't resolve
    -   No links to (lines in) source files
-   Some visual issues can be resolved with CSS
-   Remember: we can change our input format to make processing easier
    -   As long as it also makes authoring easier

## How can we avoid duplicating function names? {#avoiding-duplication}

-   If a comment is the first thing in a file, use it as title text
    -   No heading marker required
-   For each other comment, find the node on the immediately following line
    -   Can't return immediately when we find a match because methods are nested in classes
    -   Delete the line number we're seeking so that we only find the first matching node
-   Test case with one instance of each type of function

{% include file.md file="find-following-input.js" %}

-   Extract and display information from nodes immediately following doc comments

{% include wildcard.md pattern="find-following.*" values="js,sh,text" %}

-   Use this to create better output

{% include wildcard.md pattern="fill-in-headers.*" values="js" %}
{% include html.html file="fill-in-headers.html" %}

{% include links.md %}
