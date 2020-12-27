---
---

-   JavaScript was designed in a hurry 25 years ago to make pages interactive
    -   Nobody realized it would become one of the most popular programming languages in the world
    -   Which means it didn't include support for things that large programs need
    -   Like creating multi-module bundles so that browsers could load a single file
        rather than making dozens or hundreds of requests
-   A <g key="module_bundler">module bundler</g> finds all the files that an application depend on
    and combines them into a single loadable file
    -   Much more efficient to load (same number of bytes but just one request)
    -   Ensures that dependencies actually resolve
-   Requires an <g key="entry_point">entry point</g>
    -   Where processing starts
    -   Equivalently, the top level

<%- include('/inc/fig.html', {
    id: 'module-bundler-bundling',
    img: '/static/tools-small.jpg',
    alt: 'Bundling modules',
    cap: 'Combining multiple modules into one.',
    fixme: true
}) %>

-   Need to:
    -   Find all dependencies
    -   Combine them into one file
    -   Ensure they can find each other correctly once loaded
-   Think of test cases before starting to write code
    -   <g key="tdd">Test-driven development</g> (TDD)
    -   Research doesn't support claims that it makes programmers more productive <cite>Fucci2016,Fucci2017</cite>,
        but it helps give direction to this chapter
-   Case 1: a single file that doesn't require anything else
    -   Because if this doesn't work, nothing else will
    -   We will run everything via `export` to keep the examples simple

<%- include('/inc/file.html', {file: 'single/main.js'}) %>
<%- include('/inc/file.html', {file: 'expected-single.out'}) %>

-   Case 2: `main.js` requires `other.js`, which doesn't require anything
    -   First test of dependencies

<%- include('/inc/file.html', {file: 'expected-simple.out'}) %>

-   Case 3: best described with a diagram
    -   `./main` requires all four of the files below
    -   `./top-left` doesn't require anything
    -   `./top-right` requires `top-left` and `bottom-right`
    -   `./subdir/bottom-left` also requires `top-left` and `bottom-right`
    -   `./subdir/bottom-right` doesn't require anything

<%- include('/inc/fig.html', {
    id: 'module-bundler-complicated',
    img: '/static/tools-small.jpg',
    alt: 'Module bundler dependencies',
    cap: 'Dependencies in large module bundler test case.',
    fixme: true
}) %>

<%- include('/inc/file.html', {file: 'expected-full.out'}) %>

-   We do not handle <g key="circular_dependency">circular dependencies</g>
    -   Because `require` itself doesn't (<x key="module-loader"></x>)

## How can we find all the dependencies?

-   To get dependencies for one file, parse it and extract all the `require` calls
    -   Relatively straightforward given what we know about [Acorn][acorn]

<%- include('/inc/file.html', {file: 'get-requires.js'}) %>
<%- include('/inc/multi.html', {pat: 'test-get-requires.*', fill: 'js sh out'}) %>

-   To get all dependencies, need to find <g key="transitive_closure">transitive closure</g>
    -   Requirements of requirements of requirements of…
-   Algorithm uses two sets
    -   Things we have seen (initially empty)
    -   Things we haven't looked at yet (initially the first file)
-   Keep taking items from `pending` until it is empty
    -   If the current thing is already in `seen`, do nothing
    -   Otherwise get its dependencies and add them to either `seen` or `pending`

<%- include('/inc/fig.html', {
    id: 'module-bundler-transitive-closure',
    img: '/static/tools-small.jpg',
    alt: 'Implementing transitive closure',
    cap: 'Implementing transitive closure using two sets.',
    fixme: true
}) %>

-   Complicated by the fact that we can load something under different names
    -   `./subdir/bottom-left` from `main`, but `./bottom-left` from `./subdir/bottom-right`
    -   We will use <g key="absolute_path">absolute paths</g> as unique identifiers
-   Also complicated by the fact that JavaScript's `Set` doesn't have an equivalent of `Array.pop`
    -   So we will maintain the "set" of pending items as a list

<%- include('/inc/file.html', {file: 'transitive-closure-only.js'}) %>
<%- include('/inc/multi.html', {pat: 'test-transitive-closure-only.*', fill: 'js sh out'}) %>

-   This works…
-   …but we're not keeping track of the mapping from required names within files to absolute paths
-   So modify transitive closure to construct and return a two-level structure
    -   Primary keys are the absolute paths to the files being required
    -   Sub-keys are the paths they refer to when loading things
    -   Values are top-level keys

<%- include('/inc/fig.html', {
    id: 'module-bundler-structure',
    img: '/static/tools-small.jpg',
    alt: 'Data structure for modules',
    cap: 'Data structure used to map names to absolute paths.',
    fixme: true
}) %>

<%- include('/inc/file.html', {file: 'transitive-closure.js'}) %>
<%- include('/inc/multi.html', {pat: 'test-transitive-closure.*', fill: 'js sh out'}) %>

## How can we safely combine several files into one?

-   Use the same method as in <x key="module-loader"></x>
    -   Wrap the source code in an <g key="iife">IIFE</g>
    -   Give it a `module` object to fill in
    -   And an implementation of `require` to resolve dependencies *within the same file*
-   For example, suppose we have this file

<%- include('/inc/file.html', {file: 'sanity-check-unwrapped.js'}) %>

-   The wrapped version will look like this:

<%- include('/inc/file.html', {file: 'sanity-check-wrapped.js'}) %>

-   And we can test it like this

<%- include('/inc/multi.html', {pat: 'sanity-check-test.*', fill: 'js out'}) %>

-   But we want to do this for multiple files
-   So we will create a map of these functions with absolute paths as keys
-   And wrap the loading in a function so that we don't accidentally step on anyone else's toys

<%- include('/inc/file.html', {file: 'combine-files.js'}) %>

-   Breaking it down
    -   `HEAD` creates a function of no arguments and a lookup table
    -   `TAIL` returns the lookup table from that function
    -   In between, `combineFiles` adds an entry to the lookup table for each file

<%- include('/inc/fig.html', {
    id: 'module-bundler-head-tail',
    img: '/static/tools-small.jpg',
    alt: 'Assembling runnable code',
    cap: 'Assembling fragments and modules to create a bundle.',
    fixme: true
}) %>

-   Test it with our intermediate two-file case

<%- include('/inc/file.html', {file: 'test-combine-files.js'}) %>
<%- include('/inc/file.html', {file: 'test-combine-files-simple.js'}) %>

-   We can check that this works by loading the file and calling `initialize`

<%- include('/inc/file.html', {file: 'show-combine-files-simple.out'}) %>

-   This has not created our exports yet
-   Instead, it has created a lookup table of functions that can create what we asked for

## How can files access each other?

-   We have:
    -   A map from absolute filenames to functions that create the exports for those modules
    -   A map from absolute filenames to pairs of (written import name, absolute filename)
    -   An entry point
-   So we:
    -   Look up the function associated with the entry point
    -   Run it, giving it an empty module object and a `require` function (more below)
    -   Get the `exports` from the module object

<%- include('/inc/fig.html', {
    id: 'module-bundler-extract',
    img: '/static/tools-small.jpg',
    alt: 'Extracting exports from modules',
    cap: 'Extracting exports names from modules after initialization.',
    fixme: true
}) %>

-   Our replacement for `require` is only allowed to take one argument
-   But it actually needs four things
    -   The argument to the user's `require` call
    -   The absolute path of the file making the call
    -   The two lookup tables
-   The lookup tables can't be global variables because of possible name collisions
-   So we will use <g key="closure">closures</g>
    -   A function that takes the two tables as arguments…
    -   …and returns a function that takes an absolute path identifying this module…
    -   …and returns a function that takes a local path inside a module and returns the exports
    -   Each layer of wrappers remembers more information

<%- include('/inc/fig.html', {
    id: 'module-bundler-returning-functions',
    img: '/static/tools-small.jpg',
    alt: 'Functions returning functions returning functions',
    cap: 'A function that returns functions that return functions.',
    fixme: true
}) %>

-   We're also going to need a third structure: a cache for the modules we've already loaded
-   To prove it works, we will look up the function `main` in the first file and call it
    -   If we were loading in the browser, we'd capture the exports in a variable for later use

<%- include('/inc/file.html', {file: 'create-bundle.js'}) %>

-   This code is really hard to read
    -   What is being printed in the output vs. what is being executed right now
    -   The levels of nesting needed to capture variables safely
    -   Took much more time per line of finished code than anything except the promises in <x key="async-programming"></x>
-   Run this to create a bundled version of the single file

<%- include('/inc/file.html', {file: 'test-create-bundle-single.sh'}) %>
<%- include('/inc/file.html', {file: 'bundle-single.js'}) %>

-   And when we run it

<%- include('/inc/file.html', {file: 'test-bundle-single.out'}) %>

-   That was a lot of work to print one line
    -   But it should work for other files
-   Make and run a bundle for the simple case (`main` and `other`)

<%- include('/inc/file.html', {file: 'bundle-simple.js'}) %>
<%- include('/inc/file.html', {file: 'test-bundle-simple.out'}) %>

-   And for the full case (`main` plus four other files)

<%- include('/inc/file.html', {file: 'test-bundle-full.out'}) %>
