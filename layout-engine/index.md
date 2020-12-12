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
-   Coordinate system puts (0, 0) in the upper left corner
    -   Increasing Y goes down
    -   Increasing X goes to the right

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

-   Suppose we start with the upper left corner of the browser (0, 0)
    -   Upper because we lay out the page top-to-bottom
    -   Left because we are doing left-to-right layout
-   If the cell is a block, just place it
-   If the cell is a row:
    -   Calculate y1 = y0 + height
    -   Place the first child at (x0, y1)
    -   Place the next child at (x0 + width, y1)
-   If the cell is a column:
    -   Place the first child at (x0, y0 + height0)
    -   Place the next at (x0, y0 + height0 + height1), etc.
-   Derive classes from previous classes to save testing
-   Blocks

<%- include('/inc/keep.html', {file: 'placed.js', key: 'block'}) %>

-   Columns

<%- include('/inc/keep.html', {file: 'placed.js', key: 'col'}) %>

-   Rows

<%- include('/inc/keep.html', {file: 'placed.js', key: 'row'}) %>

-   Write and run some tests

<%- include('/inc/erase.html', {file: 'test/test-placed.js', key: 'large'}) %>
<%- include('/inc/file.html', {file: 'test-placed.out'}) %>

## How can we render elements?

-   Element coordinates are good for testing but not good for understanding
-   Create a "screen" of space characters

<%- include('/inc/keep.html', {file: 'render.js', key: 'makeScreen'}) %>

-   Fill in blocks using successive letters

<%- include('/inc/keep.html', {file: 'render.js', key: 'makeScreen'}) %>

-   JavaScript doesn't support [mixin classes][mixin-class]
    -   Add shared functionality after the fact by giving classes methods with the same [signatures][signature]

<%- include('/inc/file.html', {file: 'rendered.js'}) %>

-   Tests are a little easier to read (sort of)

<%- include('/inc/keep.html', {file: 'test/test-rendered.js', key: 'large'}) %>

## How can we wrap elements to fit?

-   Suppose we fix the width of a row
    -   For now, assume all its children are less than or equal to this width
-   Layout may need to wrap around
    -   Assume columns can always be made as big as they need to be
-   Solve the problem by transforming the tree
-   Blocks and columns become themselves
    -   But we need to wrap columns' children, so that class still needs a new method

<%- include('/inc/keep.html', {file: 'wrapped.js', key: 'blockcol'}) %>

-   Each row is replaced with a row containing a single column with one or more rows (wrapping)
    -   Replacement is unnecessary when everything will fit on a single row, but uniform is easier to code
-   Constructor takes the width followed by the children
-   Return the fixed width when asked

<%- include('/inc/keeperase.html', {file: 'wrapped.js', keep: 'row', erase: 'wrap'}) %>

-   Wrapping puts children into buckets, then converts the buckets to a row of a column of rows

<%- include('/inc/keep.html', {file: 'wrapped.js', key: 'wrap'}) %>

-   Bring forward all the previous tests
-   Write some new ones

<%- include('/inc/keep.html', {file: 'test/test-wrapped.js', key: 'example'}) %>

## What subset of CSS will we support?

-   Our subset of HTML includes rows, columns, and text blocks
-   Each text block has one or more lines of text
    -   Number of lines determines height
    -   Length of longest line determines width
-   Rows and columns can have attributes
    -   Each attribute must have a single quoted value
    -   Rows no longer take a fixed width: our CSS will handle that

<%- include('/inc/file.html', {file: 'micro-dom.js'}) %>

-   Use regular expressions to parse documents, though [this is a sin][stack-overflow-html-regex]
-   Main body

<%- include('/inc/erase.html', {file: 'parse.js', key: 'makenode'}) %>

-   Two functions that do most of the work

<%- include('/inc/keep.html', {file: 'parse.js', key: 'makenode'}) %>

-   Now define a generic class for rules and a subclass for each type of rule
-   ID rules take precedence over class rules, which take precedence over tag rules
    -   Number the derived classes

<%- include('/inc/keep.html', {file: 'micro-css.js', key: 'css'}) %>

-   ID rules
    -   <g key="dom_selector">DOM selector</g> of the form `#name`
    -   HTML of the form `<tag id="name">…</tag>` (where `tag` is `row` or `col`)

<%- include('/inc/keep.html', {file: 'micro-css.js', key: 'id'}) %>

-   Class rules
    -   DOM selector of the form `.kind`
    -   HTML of the form `<tag class="kind">…</tag>`
    -   Only one class per node

<%- include('/inc/keep.html', {file: 'micro-css.js', key: 'class'}) %>

-   Tag rules
    -   DOM selector of the form `tag`
    -   HTML of the form `<tag>…</tag>`

<%- include('/inc/keep.html', {file: 'micro-css.js', key: 'tag'}) %>

-   Convert JSON to rule objects
    -   Saves us writing yet another parser
    -   Really should have the CSS rule classes look at the rule and decide if it's theirs using a `static` method
    -   Would reduce the <g key="coupling">coupling</g> between the classes
    -   Of course, then we'd have to stop accessing objects' attributes directly…
-   Provide a method for finding the rules for a given DOM node
    -   Requires custom sorting that depends on CSS classes having a precedence order

<%- include('/inc/file.html', {file: 'micro-css-ruleset.js'}) %>
