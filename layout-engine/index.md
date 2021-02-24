---
---

You might be reading this as an HTML page,
an e-book (which is basically the same thing),
or on the printed page.
In all three cases,
a <g key="layout_engine">layout engine</g> took some text and some layout instructions
and decided where to put each character and image.
We will build a small layout engine in this chapter
based on [Matt Brubeck][brubeck-matt]'s [tutorial][browser-tutorial]
to explore how browsers decide what to put where.

Our inputs will be a very small subset of HTML and an equally small subset of CSS.
We will create our own classes to represent these
instead of using those provided by various [Node][nodejs] libraries;
to translate the combination of HTML and CSS into text on the screen,
we will label each node in the DOM tree with the appropriate styles,
walk that tree to figure out where each visible element belongs,
and then draw the result as text on the screen.

::: callout
### Upside down

The coordinate systems for screens put (0, 0) in the upper left corner instead of the lower left.
X increases to the right as usual,
but Y increases as we go down, rather than up
(<f key="layout-engine-coordinate-system"></f>).
This convention is a holdover from the days of teletype terminals
that printed lines on rolls of paper;
as [Mike Hoye][hoye-mike] has [repeatedly observed][punching-holes],
the past is all around us.
:::

<%- include('/inc/figure.html', {
    id: 'layout-engine-coordinate-system',
    img: './figures/coordinate-system.svg',
    alt: 'Coordinate system',
    cap: 'Coordinate system with (0, 0) in the upper left corner.'
}) %>

## How can we size rows and columns?

Let's start on <g key="easy_mode">easy mode</g>
without margins, padding, line-wrapping, or other complications.
Everything we can put on the screen is represented as a rectangular cell,
and every cell is either a row, a column, or a block.
A block has a fixed width and height:

<%- include('/inc/keep.html', {file: 'easy-mode.js', key: 'block'}) %>

A row arranges one or more cells horizontally;
its width is the sum of the widths of its children,
while its height is the height of its tallest child
(<f key="layout-engine-sizing"></f>):

<%- include('/inc/keep.html', {file: 'easy-mode.js', key: 'row'}) %>

<%- include('/inc/figure.html', {
    id: 'layout-engine-sizing',
    img: './figures/sizing.svg',
    alt: 'Calculating sizes of fixed blocks',
    cap: 'Calculating sizes of blocks with fixed width and height.'
}) %>

Finally,
a column arranges one or more cells vertically;
its width is the width of its widest child
and its height is the sum of the heights of its children.
(Here and elsewhere we use the abbreviation `col` when referring to columns.)

<%- include('/inc/keep.html', {file: 'easy-mode.js', key: 'col'}) %>

Rows and columns nest inside one another:
a row cannot span two or more columns,
and a column cannot cross the boundary between two rows.
Any time we have a structure with that property
we can represent it as a tree of nested objects.
Given such a tree,
we can calculate the width and height of each cell every time we need to.
This is simple but inefficient:
we could calculate both width and height at the same time
and <g key="cache">cache</g> those values to avoid recalculation,
but we called this "easy mode" for a reason.

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
If the cell is a block, we place it there.
If the cell is a row, on the other hand,
we get its height
and then calculate its lower edge as y1 = y0 + height.
We then place the first child's lower-left corner at (x0, y1),
the second child's at (x0 + width0, y1), and so on
(<f key="layout-engine-layout"></f>).
Similarly,
if the cell is a column
we place the first child at (x0, y0),
the next at (x0, y0 + height0),
and so on.

<%- include('/inc/figure.html', {
    id: 'layout-engine-layout',
    img: './figures/layout.svg',
    alt: 'Laying out rows and columns',
    cap: 'Laying out rows and columns of fixed-size blocks.'
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
(A more sophisticated version of this called <g key="z_buffering">z-buffering</g>
keeps track of the visual depth of each pixel
in order to draw things in three dimensions.)

<%- include('/inc/figure.html', {
    id: 'layout-engine-draw-over',
    img: './figures/draw-over.svg',
    alt: 'Children drawing over their parents',
    cap: 'Render blocks by drawing child nodes on top of parent nodes.'
}) %>

Our pretended screen is just an array of arrays of characters:

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
If we were building a real layout engine,
a cleaner solution would be to go back and create a class called `Cell` with this `render` method,
then derive our `Block`, `Row`, and `Col` classes from that.
In general,
if two or more classes need to be able to do something,
we should add a method to do that to their lowest common ancestor.
:::

Our simpler tests are a little easier to read once we have rendering in place,
though we still had to draw things on paper to figure out our complex ones:

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
(The other, these days, is that the printed page doesn't spy on us,
though someone is undoubtedly working on that…)

To add wrapping to our layout engine,
suppose we fix the width of a row.
If the total width of the children is greater than the row's width,
the layout engine needs to wrap the children around.
This assumes that columns can be made as big as they need to be,
i.e.,
that we can grow vertically to make up for limited space horizontally.
It also assumes that all of the row's children are no wider than the width of the row;
we will look at what happens when they're not in the exercises.

Our layout engine manages wrapping by transforming the tree.
The height and width of blocks are fixed,
so they become themselves.
Columns become themselves as well,
but since they have children that might need to wrap,
the class representing columns needs a new method:

<%- include('/inc/keep.html', {file: 'wrapped.js', key: 'blockcol'}) %>

Rows do all the hard work.
Each original row is replaced with a new row that contains a single column with one or more rows,
each of which is one "line" of wrapped cells
(<f key="layout-engine-wrap"></f>).
This replacement is unnecessary when everything will fit on a single row,
but it's easiest to write the code that does it every time;
we will look at making this more efficient in the exercises.

<%- include('/inc/figure.html', {
    id: 'layout-engine-wrap',
    img: './figures/wrap.svg',
    alt: 'Wrapping rows',
    cap: 'Wrapping rows by introducing a new row and column.'
}) %>

Our new wrappable row's constructor takes a fixed width followed by the children
and returns that fixed width when asked for its size:

<%- include('/inc/keeperase.html', {file: 'wrapped.js', keep: 'row', erase: 'wrap'}) %>

::: continue
Wrapping puts the row's children into buckets,
then converts the buckets to a row of a column of rows:
:::

<%- include('/inc/keep.html', {file: 'wrapped.js', key: 'wrap'}) %>

Once again we bring forward all the previous tests
and write some new ones to test the functionality we've added:

<%- include('/inc/keep.html', {file: 'test/test-wrapped.js', key: 'example'}) %>
<%- include('/inc/file.html', {file: 'test-wrapped.out'}) %>


::: callout
### The Liskov Substitution Principle

We are able to re-use tests like this because of
the <g key="liskov_substitution_principle">Liskov Substitution Principle</g>,
which states that
it should be possible to replace objects in a program
with objects of derived classes
without breaking anything.
In order to satisfy this principle,
new code must handle the same set of inputs as the old code,
though it may be able to process more inputs as well.
Conversely,
its output must be a subset of what the old code produced
so that whatever is downstream from it won't be surprised.
Thinking in these terms leads to a methodology called
<g key="design_by_contract">design by contract</g>.
:::

## What subset of CSS will we support?

It's finally time to style pages that contain text.
Our final subset of HTML has rows, columns, and text blocks as before.
Each text block has one or more lines of text;
the number of lines determines the block's height
and the length of the longest line determines its width.

Rows and columns can have <g key="attribute">attributes</g> just as they can in real HTML,
and each attribute must have a single value in quotes.
Rows no longer take a fixed width:
instead,
we will specify that with our little subset of CSS.
Together,
these three classes are just over 40 lines of code:

<%- include('/inc/erase.html', {file: 'micro-dom.js', key: 'erase'}) %>

We will use regular expressions to parse HTML
(though as we explained in <x key="regex-parser"></x>,
[this is a sin][stack-overflow-html-regex]).
The main body of our parser is:

<%- include('/inc/erase.html', {file: 'parse.js', key: 'skip'}) %>

::: continue
while the two functions that do most of the work are:
:::

<%- include('/inc/keep.html', {file: 'parse.js', key: 'makenode'}) %>

::: continue
and:
:::

<%- include('/inc/keep.html', {file: 'parse.js', key: 'makeopening'}) %>

The next step is to define a generic class for CSS rules
with a subclass for each type of rule.
From highest precedence to lowest,
the three types of rules we support identify specific nodes via their ID,
classes of nodes via their `class` attribute,
and types of nodes via their element name.
We keep track of which rules take precedence over which through the simple expedient of numbering the classes:

<%- include('/inc/keep.html', {file: 'micro-css.js', key: 'css'}) %>

An ID rule's <g key="dom_selector">DOM selector</g> is written as `#name`
and matches HTML like `<tag id="name">…</tag>` (where `tag` is `row` or `col`):

<%- include('/inc/keep.html', {file: 'micro-css.js', key: 'id'}) %>

A class rule's DOM selector is written as `.kind` and matches HTML like `<tag class="kind">…</tag>`.
Unlike real CSS,
we only allow one class per node:

<%- include('/inc/keep.html', {file: 'micro-css.js', key: 'class'}) %>

Finally,
tag rules just have the name of the type of node they apply to without any punctuation:

<%- include('/inc/keep.html', {file: 'micro-css.js', key: 'tag'}) %>

We could build yet another parser to read a subset of CSS and convert it to objects,
but this chapter is long enough,
so we will write our rules as JSON:

```js
{
  'row': { width: 20 },
  '.kind': { width: 5 },
  '#name': { height: 10 }
}
```

::: continue
and build a class that converts this representation to a set of objects:
:::

<%- include('/inc/keep.html', {file: 'micro-css.js', key: 'ruleset'}) %>

Our CSS ruleset class also has a method for finding the rules for a given DOM node.
This method relies on the precedence values we defined for our classes
in order to sort them
so that we can find the most specific.

Here's our final set of tests:

<%- include('/inc/keep.html', {file: 'test/test-styled.js', key: 'test'}) %>

If we were going on,
we would override the cells' `getWidth` and `getHeight` methods to pay attention to styles.
We would also decide what to do with cells that don't have any styles defined:
use a default,
flag it as an error,
or make a choice based on the contents of the child nodes.
We will explore these possibilities in the exercises.

::: callout
### Where it all started

This chapter's topic was the seed from which this entire book grew.
After struggling with CSS for several years,
[Greg Wilson][wilson-greg] began wondering whether it really had to be so complicated.
That question led to others,
which eventually led to all of this.
The moral of the story is,
be careful what you ask…
:::
