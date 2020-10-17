---
---

-   JavaScript was designed in a hurry 25 years ago to make pages interactive
    -   Nobody realized it would become one of the most popular programming languages in the world
    -   Which means it didn't include support for things that large programs need
    -   Like creating multi-module bundles so that browsers could load a single file
        rather than making dozens or hundreds of requests
-   A <g key="module_bundler">module bundler</g> finds all the files that a set of source files depend on
    and combines them into a single loadable file
    -   Much more efficient to load
    -   Ensures that dependencies actually resolve
-   Need to:
    -   Find all dependencies
    -   Combine them into one file
    -   Ensure they can find each other correctly once loaded
-   Our approach is based on <cite>Casciaro2020</cite>

## Do we need to handle circular dependencies?

-   We can visualize the network of who requires whom as a <g key="directed_graph">directed graph</g>
    -   If X requires Y, draw an arrow from X to Y
-   A <g key="circular_dependency">circular dependency</g> exists if X depends on Y and Y depends on X
    -   Either directly or indirectly
-   May seem nonsensical, but can easily arise with <g key="plugin_architecture">plugin architectures</g>
    -   Main program loads an extension
    -   The extension calls utility functions defined alongside the main program
-   Most <g key="compiled_language">compiled languages</g> can handle this
    -   Compile each module into low-level instructions
    -   <g key="link">Link</g> those to resolve dependencies
    -   Then run
-   But <g key="interpreted_language">interpreted languages</g> execute code as it loads
    -   So if X is in the process of loading Y and Y tries to call X,
        X may not (fully) exist yet
-   It sort-of works in Python
-   Create two files

<%- include('/inc/code.html', {file: 'checking/major.py'}) %>
<%- include('/inc/code.html', {file: 'checking/minor.py'}) %>

-   Fails when run from the command line

<%- include('/inc/multi.html', {pat: 'checking/py-command-line.*', fill: 'sh txt'}) %>

-   But works in the interactive interpreter

<%- include('/inc/code.html', {file: 'checking/py-interactive.txt'}) %>

-   Equivalent in JavaScript

<%- include('/inc/code.html', {file: 'checking/major.js'}) %>
<%- include('/inc/code.html', {file: 'checking/minor.js'}) %>

-   Fails on the command line

<%- include('/inc/multi.html', {pat: 'checking/js-command-line.*', fill: 'sh txt'}) %>

-   Also fails in the interactive interpreter

<%- include('/inc/code.html', {file: 'checking/js-interactive.txt'}) %>

-   So we will *not* handle circular dependencies
    -   But we *will* detect them and generate a sensible error message

## How can we safely get the contents of a module?

-   Start with a simple file that exports a single function

<%- include('/inc/code.html', {file: 'simple/other.js'}) %>

-   We can read it and eval the content:

<%- include('/inc/multi.html', {pat: 'capture-exports-pollute.*', fill: 'js sh txt'}) %>

-   But this adds the `other` function to `module.exports` of the caller
    -   Because the `module` variable in scope when `eval` is called is the caller's `module`
-   We need to create a new scope for the `eval` with something called `module` that *isn't* the caller's `module`
    -   Show a bit less output to avoid cluttering the page

<%- include('/inc/multi.html', {pat: 'capture-exports-encapsulate.*', fill: 'js sh txt'}) %>

## What should our test case include?

-   Use <g key="tdd">test-driven development</g> (TDD)
    -   Create the test cases *before* writing the code to define what the code is supposed to do
    -   Studies don't support the claim that it makes programmers more productive,
        but it doesn't seem to do any harm either
-   Simple case: `main.js` requires `other.js` from same directory

<%- include('/inc/code.html', {file: 'simple/main.js'}) %>
<%- include('/inc/code.html', {file: 'simple/other.js'}) %>

-   Expected behavior

<%- include('/inc/multi.html', {pat: 'simple/expected.*', fill: 'sh txt'}) %>

-   More complicated case
    -   Name the files geometrically to help keep them straight
-   `main.js` is the <g key="entry_point">entry point</g>
    -   `./top-left.js` doesn't require anything else
    -   `./top-right.js` requires `./top-left.js` and `./subdir/bottom-right.js`
    -   `./bottom-left.js` requires `../top-left.js` and `./bottom-right.js`
    -   `./bottom-right.js` doesn't require anything else

<%- include('/inc/code.html', {file: 'full/main.js'}) %>
<%- include('/inc/code.html', {file: 'full/top-left.js'}) %>
<%- include('/inc/code.html', {file: 'full/top-right.js'}) %>
<%- include('/inc/code.html', {file: 'full/subdir/bottom-left.js'}) %>
<%- include('/inc/code.html', {file: 'full/subdir/bottom-right.js'}) %>

-   Run `main.js` directly
-   When we're done, we should have a single `.js` file that produces exactly the same output

<%- include('/inc/multi.html', {pat: 'full/expected.*', fill: 'sh txt'}) %>

## How can we load a single file?

FIXME

## How can we combine multiple files?

-   Concatenate the source of the files
    -   But wrap each in a function that takes a parameter called `module`
    -   And then save the value of `module.exports` (if any)
-   Result is going to look like this:

<%- include('/inc/multi.html', {pat: 'concatenate-by-hand.*', fill: 'js txt'}) %>

-   Create a lookup table with one entry for each module
-   Use the filename as a key
    -   We will revisit this later
-   Create the function we need with a `module` parameter
-   Call it immediately to get the module's exports
    -   An <g key="iifd">immediately-invoked function declaration</g> (IFFD)
    -   Parentheses around function definition are required by JavaScript parser
    -   Pass in an empty object to be filled in and returned
-   We can create this by concatenating strings
    -   It would be nice if JavaScript template literals could be defined in one place
        and filled in somewhere else
    -   Since they can't, we'll use string replacement
-   Note that we create `everything` rather than `const everything`
    -   FIXME: why doesn't the latter work?
-   Testing this is a multi-step process
    -   Run `concatenate-programmatically.js` with `simple/other.js` as an argument
        to create a file we can execute that contains a module definition

<%- include('/inc/multi.html', {pat: 'concatenate-programmatically.*', fill: 'js sh'}) %>
<%- include('/inc/code.html', {file: 'concatenate-programmatically-output.js'}) %>

-   Load and evaluate that file and check that `everything` is defined correctly

<%- include('/inc/multi.html', {pat: 'concatenate-programmatically-output-test.*', fill: 'js txt'}) %>

## How can we find all the dependencies?

-   To get dependencies for one file, parse it and extract all the `require` calls
    -   Relatively straightforward given what we know about [Acorn][acorn]
    -   Though notice how we build the module so that it can be run from the command line *or* loaded

<%- include('/inc/multi.html', {pat: 'extract-require.*', fill: 'js sh txt'}) %>

-   To get all dependencies, need to find <g key="transitive_closure">transitive closure</g>
    -   Requirements of requirements of requirements of...
    -   But allow for the case of X and Y requiring each other
-   Algorithm uses two sets
    -   Things we have seen (initially empty)
    -   Things we haven't looked at yet (initially the first file)
-   Keep taking items from `pending` until it is empty
    -   If the current thing is already in `seen`, do nothing
    -   Otherwise get its dependencies and add them to either `seen` or `pending`
-   Complicated by the fact that we can load something under different names
    -   `./subdir/bottom-left` from `main`, but `./bottom-left` from `./subdir/bottom-right`
    -   We will use <g key="absolute_path">absolute paths</a> as unique identifiers
-   Also complicated by the fact that JavaScript's `Set` doesn't have an equivalent of `Array.pop`
    -   So we will maintain the "set" of pending items as a list

<%- include('/inc/multi.html', {pat: 'transitive-closure-only.*', fill: 'js sh txt'}) %>

-   This works...
-   ...but we're not keeping track of the mapping from required names within files to absolute paths
-   So modify transitive closure to construct and return a second structure
    -   Primary keys are the absolute paths to the files being required
    -   Sub-keys are the paths actually used for loading
    -   Values are primary keys

<%- include('/inc/multi.html', {pat: 'transitive-closure.*', fill: 'js sh txt'}) %>
