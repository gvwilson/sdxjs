---
---

-   Goal: check that source code conforms to style guidelines.
    -   Tools like this are called <g key="linter">linters</g> in honor of an early one named `lint`
        (which looked for fluff in source code).
-   Inspirations:
    -   [ESLint][eslint]
-   Design:
    -   Parse source to create an <g key="ast">abstract syntax tree</g> (AST)
    -   <g key="walk_a_tree">Walk</g> the AST and apply rules at each node
    -   Express each rule as a function that takes the node and an object for collecting results
    -   Report all results at the end

## How can we parse JavaScript to create an AST?

-   Use [Acorn][acorn]

<%- include('/_inc/multi.html', {pat: 'parse-single-const.*', fill: 'js text'}) %>

## What is included in the AST?

-   [Esprima][esprima] format
-   Look at the result of parsing a slightly more complex program

<%- include('/_inc/multi.html', {pat: 'parse-const-func-and-call.*', fill: 'js text'}) %>

## How can we walk the AST?

-   Use a helper library `acorn-walk`
    -   Provide a function to act on nodes of type `Identifier`
    -   Accumulate comments in the `onComment` array during parsing

<%- include('/_inc/multi.html', {pat: 'walk-ast.*', fill: 'js text'}) %>

## How can we apply checks?

-   Check the desired properties of nodes of interest
-   Accumulate results on demand
    -   Only create arrays of results when nodes of that type are encountered
    -   Only insert nodes that fail checks
-   Hm: why doesn't the parameter `x` show up as a violation?

<%- include('/_inc/multi.html', {pat: 'check-name-lengths.*', fill: 'js text'}) %>

## How does the AST walker work?

-   Use the <g key="visitor_pattern">Visitor</g> design pattern
-   Define a class with methods that
    -   Walk the tree
    -   Take action at each kind of node
    -   Go through the children of that node
-   Users overrides the set of action methods they're interested in
    -   Use <g key="dynamic_lookup">dynamic lookup</g> to look up a method
        with the same name as the node type in the walker object
    -   I.e., use the walker object as a lookup table
-   Not the same architecture as `acorn-walk`
    -   Easier to understand and extend

<%- include('/_inc/multi.html', {pat: 'walker-class.*', fill: 'js text'}) %>

## How else could the AST walker work?

-   An alternative approach uses the <g key="iterator_pattern">Iterator</g> pattern
    -   Return elements of a complex structure one by one for processing
    -   Visitor takes computation to the nodes, Iterator gets the nodes for processing
-   Can implement in JavaScript using <g key="generator_function">generator functions</g>
-   Use `yield` to return a value and suspend processing to be resumed later
    -   Result is a two-part structure with `value` and `done`
-   Note that a generator function returns an object that then returns values

<%- include('/_inc/multi.html', {pat: 'generator-example.*', fill: 'js text'}) %>

-   This generator takes an irregular nested array of strings and yields:
    -   A string
    -   Another generator (using `yield*` to mean "uses its values until they run out")

<%- include('/_inc/code.html', {file: 'generator-tree.js'}) %>

-   Manage iteration explicitly

<%- include('/_inc/multi.html', {pat: 'generator-tree-while.*', fill: 'js text'}) %>

-   But `for…of` knows how to work with generators

<%- include('/_inc/multi.html', {pat: 'generator-tree-for.*', fill: 'js text'}) %>

-   Use this to count the number of expressions of various types in code

<%- include('/_inc/multi.html', {pat: 'generator-count.*', fill: 'js text'}) %>

-   More difficult to do variable identifiers than previous Visitor approach
    -   Generator doesn't keep state, so we have to maintain that outside for ourselves
