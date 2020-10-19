---
---

A pure-text layout engine showing how browsers decide what to put where,
based on [Matt Brubeck's tutorial][browser-tutorial].

-   Inputs are:
    -   A very small subset of HTML, which is converted to <g key="dom">DOM</g> nodes
    -   A very small subset of CSS (which we represent as JSON so that we don't have to write another parser)
-   Processing is:
    -   Produce a tree of styled nodes from the DOM
    -   Walk this tree to figure out where each visible element belongs
    -   Render this (as plain text)

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

## How can we position rows and columns?

-   Suppose we start with the upper left corner of the browser (X0, Y1)
    -   Upper because we lay out the page top-to-bottom
    -   Left because we are doing left-to-right layout
-   If the cell is a column:
    -   Place the first child at (x0, y1) = (X0, Y1)
    -   Place the next at (x0, y1) = (X0, Y1-height), etc.
-   If the cell is a row:
    -   Place the first child at (x0, y1) = (X0, Y1)
    -   Place the next child at (x0, y1) = (X0+width, Y1)
-   If the cell is a block, just place it

<%- include('/inc/code.html', {file: 'easy-mode.js'}) %>
<%- include('/inc/multi.html', {pat: 'test-easy-mode.*', fill: 'sh txt'}) %>
