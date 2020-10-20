
## How can we handle a small subset of HTML?

-   Our subset of HTML includes:
    -   Plain text, which we store as instances of `TextNode`
    -   Elements with attributes, which we store as instances of `TagNode`
    -   Don't support <g key="empty_element">empty elements</g> or comments
    -   Each attribute must have a single quoted value
-   Use regular expressions to parse, though [this is a sin][stack-overflow-html-regex]

<%- include('/inc/code.html', {file: 'parse.js'}) %>

-   The nodes are straightforward

<%- include('/inc/code.html', {file: 'dom.js'}) %>

## How can we handle a small subset of CSS?

-   Our subset of CSS supports:
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
-   Define a generic class for rules and a subclass for each type of rule
-   Convert JSON to rule objects
-   Provide a method for finding the rules for a given DOM node
    -   Requires custom sorting
-   Also provide default settings for various kinds of nodes
    -   These were added after building the next stage of the pipeline

<%- include('/inc/code.html', {file: 'css.js'}) %>

## How can we construct a styled tree?

-   This is a good time to decide exactly what HTML and CSS we will support
    -   `body` may contain `row` or `p` (paragraph), which are stacked vertically
    -   `row` may contain `col` (column), which are laid out horizontally
    -   `col` may contain `row` or `p`, which again are stacked vertically
    -   Could get rid of `body` and require an outermost `col`, but we're traditionalists
-   Any element can specify `visible=false` to be taken out of the layout
    -   This is like HTML's `display` property (HTML's `visible` means "take up space but don't render")
-   Any element can specify `width` to fix its width
    -   Any text that overflows is lost
-   A `p` must contain exactly one `TextNode`, and its text content is wrapped

-  Construct a styled tree with:
   -   Nodes that are actually going to be rendered
   -   Rules collapsed to concrete attribute lists for each node

<%- include('/inc/code.html', {file: 'styled.js'}) %>

## How can we lay out a styled tree?

-   Finally get to lay things out
    -   If a node's layout is vertical:
        -   Width of this node is width of parent
        -   Set widths of children to be width of this node
        -   Find heights of children
        -   Position children
        -   Height of this element is sum of heights of children
    -   If a node's layout is horizontal:
        -   Find widths of children
        -   Find heights of children
        -   Position children
        -   Max of heights becomes height of row
    -   If a node's content wraps
        -   Replace single text node with one node for each line
        -   Lay those out in a vertical stack
        -   Sum of heights becomes height of node

<%- include('/inc/code.html', {file: 'layout.js'}) %>

-   And then render
    -   Create a "screen" filled with background markers
    -   Walk the tree, asking each node to draw itself
    -   Only `TextNode`s actually 

<%- include('/inc/code.html', {file: 'render.js'}) %>
