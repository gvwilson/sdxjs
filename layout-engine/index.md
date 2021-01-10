---
---

You might be reading this as an HTML page,
an e-book (which is basically the same thing),
or on the printed page.
In all three cases,
a piece of software took some text and some layout instructions
and decided where each character and image was going to go.
A tool that does that is called a <g key="layout_engine">layout engine</g>,
and in this chapter we will build a small one
based on [Matt Brubeck][brubeck-matt]'s [tutorial][browser-tutorial]
to explore how browsers decide what to put where.

Our inputs will be a very small subset of HTML and an equally small subset of CSS.
To keep things simple
we will create our own classes for these instead of using those provided by
various [Node][nodejs] libraries.
To translate the combination of HTML and CSS into text on the screen,
we will label each node in the DOM tree with the appropriate styles,
walk that tree to figure out where each visible element belongs,
and then draw the result as text on the screen.

::: callout
### Upside down

The coordinate systems for screens put (0, 0) in the upper left corner instead of the lower left.
X increases to the right as usual,
but Y increases as we go down, rather than up
(<f key="layout-engine-coordinate-system"></f>).
This convention is a holdover from the days of teletype terminals,
which printed each successive line below the one before it.
:::

<%- include('/inc/figure.html', {
    id: 'layout-engine-coordinate-system',
    img: '/static/tools-small.jpg',
    alt: 'Coordinate system',
    cap: 'Coordinate system with (0, 0) in the upper left corner.',
    fixme: true
}) %>

## How can we size rows and columns?

Let's start on <g key="easy_mode">easy mode</g> without margins, padding, line-wrapping, or other complications.
We define a cell as a row, a column, or a block.
A block has a fixed width and height (hence the name):

<%- include('/inc/keep.html', {file: 'easy-mode.js', key: 'block'}) %>

::: continue
A row arranges one or more cells horizontally;
its width is the sum of the widths of its children,
while its height is the maximum height of any of its children
(<f key="layout-engine-sizing"></f>):
:::

<%- include('/inc/keep.html', {file: 'easy-mode.js', key: 'row'}) %>

::: continue
Finally,
a column arranges one or more cells vertically;
its width is the maximum width of its children,
and its height is the sum of the heights of its children.
(Here and elsewhere we use the abbreviation `col` when referring to columns.)
:::

<%- include('/inc/keep.html', {file: 'easy-mode.js', key: 'col'}) %>

We represent a tree of cells as a collection of nested objects
and recalculate the width and height of each cell each time they're needed.
This is simple but inefficient:
we could calculate both width and height at the same time
and <g key="cache">cache</g> calculated values to avoid recalculation,
but it's called "easy mode" for a reason.

<%- include('/inc/figure.html', {
    id: 'layout-engine-sizing',
    img: '/static/tools-small.jpg',
    alt: 'Calculating sizes of fixed blocks',
    cap: 'Calculating sizes of blocks with fixed width and height.',
    fixme: true
}) %>

As simple as it is,
this code could still contain errors (and did during development),
so we write some [Mocha][mocha] tests to check that it works as desired
before trying to build anything more complicated:

<%- include('/inc/file.html', {file: 'test/test-easy-mode.js'}) %>
<%- include('/inc/file.html', {file: 'test-easy-mode.out'}) %>

## How can we position rows and columns?

Now that we know how big each cell is
we can figure out where to put it.
Suppose we start with the upper left corner of the browser:
upper because we lay out the page top-to-bottom
and left because we are doing left-to-right layout.
If the cell is a block, we just place it there.
If the cell is a row, on the other hand,
we gets its height
and then calculate its lower edge as y1 = y0 + height.
We then place the first child's lower-left corner at (x0, y1),
the second child's at (x0 + width0, y1), and so on.
Similarly,
if the cell is a column
we place the first child at (x0, y0),
the next at (x0, y0 + height0),
and so on
(<f key="layout-engine-layout"></f>).

<%- include('/inc/figure.html', {
    id: 'layout-engine-layout',
    img: '/static/tools-small.jpg',
    alt: 'Laying out rows and columns',
    cap: 'Laying out rows and columns of fixed-size blocks.',
    fixme: true
}) %>

To save ourselves some testing we will derive the classes that know how to do layout
from the classes we wrote before.
Our blocks are:

<%- include('/inc/keep.html', {file: 'placed.js', key: 'block'}) %>

::: continue
while our columns are:
:::

<%- include('/inc/keep.html', {file: 'placed.js', key: 'col'}) %>

::: continue
and our rows are:
::: continue

<%- include('/inc/keep.html', {file: 'placed.js', key: 'row'}) %>

Once again,
we write and run some tests to check that everything is doing what it's supposed to:

<%- include('/inc/erase.html', {file: 'test/test-placed.js', key: 'large'}) %>
<%- include('/inc/file.html', {file: 'test-placed.out'}) %>

## How can we render elements?

We drew the blocks on a piece of graph paper
in order to figure out the expected answers for the tests shown above.
We can do something similar in software by creating a "screen" of space characters
and then having each block draw itself in the right place.
If we do this starting at the root of the tree,
child blocks will overwrite the markings made by their parents,
which will automatically produce the right appearance
(<f key="layout-engine-draw-over"></f>).

<%- include('/inc/figure.html', {
    id: 'layout-engine-draw-over',
    img: '/static/tools-small.jpg',
    alt: 'Children drawing over their parents',
    cap: 'Render blocks by drawing child nodes on top of parent nodes.',
    fixme: true
}) %>

Making our pretend screen is a simple matter of creating an array of arrays:

<%- include('/inc/keep.html', {file: 'render.js', key: 'makeScreen'}) %>

We will use successive lower-case characters to show each block,
i.e.,
the root block will draw itself using 'a',
while its children will be 'b', 'c', and so on.

<%- include('/inc/keep.html', {file: 'render.js', key: 'draw'}) %>

To teach each kind of cell how to render itself,
we have to derive a new class from each of the ones we have
and give the new class a `render` method with the same <g key="signature">signature</g>:

<%- include('/inc/file.html', {file: 'rendered.js'}) %>

::: continue
These `render` methods do exactly the same thing,
so we have each one call a shared function that does the actual work.
If we were building this code for real,
we would go back and create a class called `Cell` with this `render` method,
then derive our original easy-mode `Block`, `Row`, and `Col` classes from that.
:::

Once we have rendering in place,
our simpler tests are a little easier to read,
though we still had to draw things on graph paper to figure out our complex ones:

<%- include('/inc/keep.html', {file: 'test/test-rendered.js', key: 'large'}) %>

::: continue
The fact that we find our own tests difficult to understand
is a sign that we should do more testing.
It would be very easy for us to get a wrong result
and convince ourselves that it was actually correct;
<g key="confirmation_bias">confirmation bias</g> of this kind
is very common in software development.
:::

## How can we wrap elements to fit?

One of the biggest differences between a browser and a printed page
is that the text in the browser wraps itself automatically as the window is resized.
The other, these days, is that the printed page doesn't spy on us,
though someone is undoubtedly working on that...

To add this to our layout engine,
suppose we fix the width of a row.
(For now,
we will assume all of the row's children are less than or equal to this width;
we will look at what happens when they're not in the exercises.)
If the total width of the children is greater than the row's width,
the layout engine needs to wrap the children around.
This assumes that columns can be made as big as they need to be,
i.e.,
that we can grow vertically to make up for limited space horizontally.

Our layout engine manages this by transforming the tree.
The height and width of blocks are fixed,
so they become themselves.
Columns become themselves as well,
but since they have children that might need to wrap,
the class representing columns needs a new method:

<%- include('/inc/keep.html', {file: 'wrapped.js', key: 'blockcol'}) %>

Rows do all the hard work.
Each row is replaced with a row containing a single column with one or more rows,
each of which is one "line" of wrapped cells
(<f key="layout-engine-wrap"></f>).
This replacement is unnecessary when everything will fit on a single row,
but it's easiest to write the code that does it every time;
we will look at making this more efficient in the exercises.

<%- include('/inc/figure.html', {
    id: 'layout-engine-wrap',
    img: '/static/tools-small.jpg',
    alt: 'Wrapping rows',
    cap: 'Wrapping rows by introducing a new row and column.',
    fixme: true
}) %>

Our new wrappable row's constructor takes a fixed width followed by the children
and returns that fixed width when asked for its size:

<%- include('/inc/keeperase.html', {file: 'wrapped.js', keep: 'row', erase: 'wrap'}) %>

Wrapping puts the row's children into buckets,
then converts the buckets to a row of a column of rows:

<%- include('/inc/keep.html', {file: 'wrapped.js', key: 'wrap'}) %>

Once again we bring forward all the previous tests,
which should produce the same answers as before,
and write some new ones to test the functionality we've added:

<%- include('/inc/keep.html', {file: 'test/test-wrapped.js', key: 'example'}) %>
<%- include('/inc/file.html', {file: 'test-wrapped.out'}) %>

## What subset of CSS will we support?

It's now time to do something a little more realistic.
Our final subset of HTML includes rows, columns, and text blocks as before.
Each text block has one or more lines of text;
the number of lines determines the block's height
while the length of the longest line determines its width.

Rows and columns can have <g key="attribute">attributes</g> just as they can in real HTML.
Each attribute must have a single quoted value,
and rows no longer take a fixed width:
our little subset of CSS will handle that.
Together,
these three classes are just over 40 lines of code:

<%- include('/inc/erase.html', {file: 'micro-dom.js', key: 'erase'}) %>

We will use regular expressions to parse HTML,
though [this is a sin][stack-overflow-html-regex].
The main body of our parser is:

<%- include('/inc/erase.html', {file: 'parse.js', key: 'makenode'}) %>

::: continue
while the two functions that do most of the work are:
:::

<%- include('/inc/keep.html', {file: 'parse.js', key: 'makenode'}) %>

The next step is to define a generic class for CSS rules
with a subclass for each type of rule.
From highest precedence to lowest,
the three types of rules we support identify specific nodes via their ID,
classes of nodes via their `class` attribute,
and then types of nodes via their element name
(<f key="layout-engine-css-precedence"></f>).

<%- include('/inc/figure.html', {
    id: 'layout-engine-css-precedence',
    img: '/static/tools-small.jpg',
    alt: 'Precedence of CSS rules',
    cap: 'Numbering CSS rules to define precedence.',
    fixme: true
}) %>

We keep track of these precedences through the simple expedient of numbering the classes:

<%- include('/inc/keep.html', {file: 'micro-css.js', key: 'css'}) %>

An ID rule has a <g key="dom_selector">DOM selector</g> of the form `#name`
and matches HTML of the form `<tag id="name">…</tag>` (where `tag` is `row` or `col`):

<%- include('/inc/keep.html', {file: 'micro-css.js', key: 'id'}) %>

A class rule has a DOM selector of the form `.kind` and matches HTML of the form `<tag class="kind">…</tag>`.
Unlike real CSS,
we only allow one class per node:

<%- include('/inc/keep.html', {file: 'micro-css.js', key: 'class'}) %>

Finally,
tag rules are identified by having just the name of the type of node they apply to:

<%- include('/inc/keep.html', {file: 'micro-css.js', key: 'tag'}) %>

We could write yet another parser to read a subset of CSS and convert it to objects,
but it's simpler to store the CSS as JSON:

<%- include('/inc/keep.html', {file: 'micro-css.js', key: 'ruleset'}) %>

::: continue
Our CSS ruleset class also has a method for finding the rules for a given DOM node.
This makes use of a custom sort that depends on CSS classes having a precedence order.
We really should have the CSS rule classes look at the rule and decide if it's theirs using a `static` method
in order to reduce the <g key="coupling">coupling</g> between the classes.
Of course, we should also stop accessing the objects' attributes directly…
:::

Here's our final set of tests:

<%- include('/inc/keep.html', {file: 'test/test-styled.js', key: 'test'}) %>

If we were going to go on,
we would override the cells' `getWidth` and `getHeight` methods to pay attention to styles.
But what about nodes that don't have a style?
We could use a default,
base it on the needs of the child nodes,
or flag it as an error.
We will explore these possibilities in the exercises.
