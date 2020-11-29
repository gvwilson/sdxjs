---
---

-   Goal: check that source code conforms to style guidelines.
    -   Tools like this are called <g key="linter">linters</g> in honor of an early one for C named `lint`
        because it looked for fluff in source code
    -   "That's legal, but you shouldn't do it"
-   Inspirations:
    -   [ESLint][eslint]
-   Design:
    -   Parse source code to create a data structure
    -   Go through the data structure and apply rules for each part of the program
    -   Collect results and report them all at the end

## How can we parse JavaScript to create an AST?

-   A parser for a simple language like arithmetic or JSON is relatively easy to write
    -   We will do it in <xref key="regex-parser"></xref>
-   A parser for a language as complex as JavaScript is much more work
-   We will use [Acorn][acorn] instead
-   Produces an <g key="abstract_syntax_tree">abstract syntax tree</g> (AST)
    whose nodes store information about what's in the program

<%- include('/_inc/multi.html', {pat: 'parse-single-const.*', fill: 'js out'}) %>

-   [Esprima][esprima] format
    -   A lot of detail
    -   But we can figure most of it out by inspection rather than by reading the standard
-   Look at the result of parsing a slightly more complex program
    -   A 9-line program produces over 500 lines of structure

<%- include('/_inc/multi.html', {pat: 'parse-const-func.*', fill: 'js out'}) %>

## How can we find things in an AST?

-   To <g key="walk_tree">walk a tree</g> means to visit each node in turn
-   Use a helper library `acorn-walk` to do this
    -   Provide a function to act on nodes of type `Identifier`
    -   Use options to say that we want to record locations and to collect comments (in the array `onComment`)
    -   We create an array called `state` to record declaration nodes as they're found
    -   Then report them all at the end

<%- include('/_inc/multi.html', {pat: 'walk-ast.*', fill: 'js out'}) %>

## How can we apply checks?

-   Check the desired properties of nodes of interest
-   Accumulate results on demand
    -   Only create arrays of results when nodes of that type are encountered
    -   Only insert nodes that fail checks

<%- include('/_inc/multi.html', {pat: 'check-name-lengths.*', fill: 'js out'}) %>

-   Ask in the exercises why the parameter `x` doesn't show up as a violation

## How does the AST walker work?

-   Use the <g key="visitor_pattern">Visitor</g> design pattern
-   Define a class with methods that
    -   Walk the tree
    -   Take action depending on the kind of node
    -   Go through the children of that node
-   Users overrides the set of action methods they're interested in
    -   Use <g key="dynamic_lookup">dynamic lookup</g> to look up a method
        with the same name as the node type in the walker object
    -   I.e., use the walker object as a lookup table
-   Not the same architecture as `acorn-walk`
    -   But easier to understand and extend
-   The class itself

<%- include('/_inc/slice.html', {file: 'walker-class.js', tag: 'walker'}) %>

-   What we need to run a test

<%- include('/_inc/erase.html', {file: 'walker-class.js', tag: 'walker'}) %>

-   Output

<%- include('/_inc/file.html', {file: 'walker-class.out'}) %>

## How else could the AST walker work?

-   An alternative approach uses the <g key="iterator_pattern">Iterator</g> pattern
    -   Return elements of a complex structure one by one for processing
    -   Visitor takes computation to the nodes, Iterator gets the nodes for processing
-   Can implement in JavaScript using <g key="generator_function">generator functions</g>
-   Use `yield` to return a value and suspend processing to be resumed later
    -   Result is a two-part structure with `value` and `done`
-   Note that a generator function returns an object that then returns values

<%- include('/_inc/multi.html', {pat: 'generator-example.*', fill: 'js out'}) %>

-   This generator takes an irregular nested array of strings and yields:
    -   A string
    -   Another generator (using `yield*` to mean "uses its values until they run out")

<%- include('/_inc/file.html', {file: 'generator-tree.js'}) %>

-   Manage iteration explicitly

<%- include('/_inc/multi.html', {pat: 'generator-tree-while.*', fill: 'js out'}) %>

-   But `for…of` knows how to work with generators

<%- include('/_inc/multi.html', {pat: 'generator-tree-for.*', fill: 'js out'}) %>

-   Use this to count the number of expressions of various types in code

<%- include('/_inc/multi.html', {pat: 'generator-count.*', fill: 'js out'}) %>

-   More difficult to do variable identifiers than previous Visitor approach
    -   Generator doesn't keep state, so we have to maintain that outside for ourselves

<%- include('/_inc/problems.html') %>
