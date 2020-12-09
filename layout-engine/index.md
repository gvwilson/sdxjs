---
---

A pure-text layout engine showing how browsers decide what to put where,
based on [Matt Brubeck][brubeck-matt]'s [tutorial][browser-tutorial].

-   Inputs are:
    -   A very small subset of HTML, which is converted to <g key="dom">DOM</g> nodes
    -   A very small subset of CSS (which we represent as JSON so that we don't have to write another parser)
-   Processing is:
    -   Produce a tree of styled nodes from the DOM
    -   Walk this tree to figure out where each visible element belongs
    -   Render this as plain text

## How can we size rows and columns?

-   Let's start on <g key="easy_mode">easy mode</g>
    -   No margins or padding or stretching or wrapping or…
-   A cell is a row, a column, or a block
-   A block has a fixed width and height
-   A row arranges one or more cells horizontally
    -   Its width is the sum of the widths of its children
    -   Its height is the maximum height of any of its children
-   A column arranges one or more cells vertically
    -   Its width is the maximum width of its children
    -   Its height is the sum of the heights of its children
-   Represent the tree as nested objects
-   Calculate width and height each time they're needed
    -   Inefficient: could calculate both at the same time
    -   And cache values and have a "changed" marker and all the other things browsers do to go faster

<%- include('/inc/file.html', {file: 'easy-mode.js'}) %>
<%- include('/inc/file.html', {file: 'test/test-easy-mode.js'}) %>
<%- include('/inc/file.html', {file: 'test-easy-mode.out'}) %>

## How can we position rows and columns?

-   Suppose we start with the upper left corner of the browser (X0, Y1)
    -   Upper because we lay out the page top-to-bottom
    -   Left because we are doing left-to-right layout
-   If the cell is a block, just place it
-   If the cell is a row:
    -   Place the first child at (x0, y1)
    -   Place the next child at (x0 + width, y1)
-   If the cell is a column:
    -   Place the first child at (x0, y1)
    -   Place the next at (x0, y1 - height), etc.
-   Derive three classes from previous classes to save testing (and printing space)

<%- include('/inc/file.html', {file: 'placed-block.js'}) %>
<%- include('/inc/file.html', {file: 'placed-row.js'}) %>
<%- include('/inc/file.html', {file: 'placed-column.js'}) %>

-   Write and run some tests

<%- include('/inc/erase.html', {file: 'test/test-placed.js', key: 'large'}) %>
<%- include('/inc/file.html', {file: 'test-placed.out'}) %>

## How can we wrap blocks to fit?

-   Suppose we fix the width of a row
    -   For now, assume all its children are less than or equal to this width
-   Layout may need to wrap around
    -   Assume columns can always be made as big as they need to be
-   Solve the problem by transforming the tree
-   Blocks and columns become themselves
    -   But we need to wrap columns' children, so that class still needs a new method

<%- include('/inc/file.html', {file: 'wrapped-column.js'}) %>

-   Each row is replaced with a row containing a single column with one or more rows (wrapping)
    -   Replacement is unnecessary when everything will fit on a single row, but uniform is easier to code
-   Constructor takes the width followed by the children
-   Return the fixed width when asked

<%- include('/inc/erase.html', {file: 'wrapped-row.js', key: 'wrap'}) %>

-   Wrapping puts children into buckets, then converts the buckets to a row of a column of rows

<%- include('/inc/keep.html', {file: 'wrapped-row.js', key: 'wrap'}) %>

-   Bring forward all the previous tests (with an extra row and column where needed)
-   Write some new ones

<%- include('/inc/keep.html', {file: 'test/test-wrapped.js', key: 'example'}) %>

## What subset of HTML and CSS will we support?

-   Our subset of HTML includes:
    -   Plain text, which we store as instances of `TextNode`
    -   Elements with attributes, which we store as instances of `TagNode`
    -   Don't support <g key="empty_element">empty elements</g> or comments
    -   Each attribute must have a single quoted value
-   Won't bother to show the tests, but yes, we wrote them, and yes, they caught errors

<%- include('/inc/file.html', {file: 'micro-dom.js'}) %>

-   Use regular expressions to parse documents, though [this is a sin][stack-overflow-html-regex]
    -   And yes, the tests caught errors
-   Main body

<%- include('/inc/erase.html', {file: 'parse.js', key: 'makenode'}) %>

-   Two functions that do most of the work

<%- include('/inc/keep.html', {file: 'parse.js', key: 'makenode'}) %>

-   Now define a generic class for rules and a subclass for each type of rule
-   ID rules
    -   <g key="dom_selector">DOM selector</g> of the form `#name`
    -   HTML of the form `<tag id="name">…</tag>`
-   Class rules
    -   DOM selector of the form `.kind`
    -   HTML of the form `<tag class="kind">…</tag>`
    -   Only one class per node
-   Tag rules
    -   DOM selector of the form `tag`
    -   HTML of the form `<tag>…</tag>`
-   ID rules take precedence over class rules, which take precedence over tag rules

<%- include('/inc/file.html', {file: 'micro-css.js'}) %>

-   Convert JSON to rule objects
    -   Saves us writing yet another parser
    -   Really should have the CSS rule classes look at the rule and decide if it's theirs using a `static` method
    -   Would reduce the <g key="coupling">coupling</g> between the classes
    -   Of course, then we'd have to stop accessing objects' attributes directly…
-   Provide a method for finding the rules for a given DOM node
    -   Requires custom sorting that depends on CSS classes having a precedence order

<%- include('/inc/file.html', {file: 'micro-css-ruleset.js'}) %>
