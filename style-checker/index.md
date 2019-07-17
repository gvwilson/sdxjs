---
---

-   Goal: check that source code conforms to style guidelines.
    -   Tools like this are called [linters][linter] in honor of an early one named `lint`
        (which looked for fluff in source code).
-   Inspirations:
    -   [ESLint][eslint]
-   Design:
    -   Parse source to create an [abstract syntax tree][ast] (AST)
    -   [Walk][walk-a-tree] the AST and apply rules at each node
    -   Express each rule as a function that takes the node and an object for collecting results
    -   Report all results at the end

## How can we parse JavaScript to create an AST? {#parsing}

-   Use [Acorn][acorn]

{% include wildcard.md pattern="parse-single-const.*" values="js,text" %}

## What is included in the AST? {#ast-structure}

-   [Esprima][esprima] format
-   Look at the result of parsing a slightly more complex program

{% include wildcard.md pattern="parse-const-func-and-call.*" values="js,text" %}

## How can we walk the AST? {#walk-ast}

-   Use a helper library `acorn-walk`
    -   Provide a function to act on nodes of type `Identifier`
    -   Accumulate comments in the `onComment` array during parsing

{% include wildcard.md pattern="walk-ast.*" values="js,text" %}

## How can we apply checks? {#check-ast}

-   Check the desired properties of nodes of interest
-   Accumulate results on demand
    -   Only create arrays of results when nodes of that type are encountered
    -   Only insert nodes that fail checks
-   Hm: why doesn't the parameter `x` show up as a violation?

{% include wildcard.md pattern="check-name-lengths.*" values="js,text" %}

## How does the AST walker work? {#visitor-pattern}

-   Use the [Visitor][visitor-pattern] design pattern
-   Define a class with methods that
    -   Walk the tree
    -   Take action at each kind of node
    -   Go through the children of that node
-   Users overrides the set of action methods they're interested in
    -   Use [dynamic lookup][dynamic-lookup] to look up a method
        with the same name as the node type in the walker object
    -   I.e., use the walker object as a lookup table
-   Not the same architecture as `acorn-walk`
    -   Easier to understand and extend

{% include wildcard.md pattern="walker-class.*" values="js,text" %}

## How else could the AST walker work? {#iterator-pattern}

-   An alternative approach uses the [Iterator][iterator-pattern] pattern
    -   Return elements of a complex structure one by one for processing
    -   Visitor takes computation to the nodes, Iterator gets the nodes for processing
-   Can implement in JavaScript using [generator functions][generator-function]
-   Use `yield` to return a value and suspend processing to be resumed later
    -   Result is a two-part structure with `value` and `done`
-   Note that a generator function returns an object that then returns values

{% include wildcard.md pattern="generator-example.*" values="js,text" %}

-   This generator takes an irregular nested array of strings and yields:
    -   A string
    -   Another generator (using `yield*` to mean "uses its values until they run out")

{% include file.md file="generator-tree.js" %}

-   Manage iteration explicitly

{% include wildcard.md pattern="generator-tree-while.*" values="js,text" %}

-   But `for…of` knows how to work with generators

{% include wildcard.md pattern="generator-tree-for.*" values="js,text" %}

-   Use this to count the number of expressions of various types in code

{% include wildcard.md pattern="generator-count.*" values="js,text" %}

-   More difficult to do variable identifiers than previous Visitor approach
    -   Generator doesn't keep state, so we have to maintain that outside for ourselves

{% include links.md %}
