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
-   Our approach is based on [Adam Kelly's tutorial][bundler-tutorial]

## What should our test case include?

-   Use <g key="tdd">test-driven development</g> (TDD)
    -   Create the test cases *before* writing the code to define what the code is supposed to do
    -   Studies don't support the claim that it makes programmers more productive,
        but it doesn't seem to do any harm either
-   Four cases
    -   File A requires File B
    -   Files A and B both require File C, and only one copy of File C is included in the bundle
    -   Files A and B require File C using different paths
    -   Files A and B require each other (a <g key="circular_dependency">circular dependency</g>)
-   Create a file `main.js` as an <g key="entry_point">entry point</g>
    -   Name the other files geometrically to help keep them straight

<%- include('/inc/code.html', {file: 'example/main.js'}) %>
<%- include('/inc/code.html', {file: 'example/top-left.js'}) %>
<%- include('/inc/code.html', {file: 'example/top-right.js'}) %>
<%- include('/inc/code.html', {file: 'example/subdir/bottom-left.js'}) %>
<%- include('/inc/code.html', {file: 'example/subdir/bottom-right.js'}) %>

FIXME: diagram

-   Run `main.js` directly
-   When we're done, we should have a single `.js` file that produces exactly the same output

<%- include('/inc/multi.html', {pat: 'example-directly.*', fill: 'sh text'}) %>

## How can we find all the dependencies?

-   To get dependencies for one file, parse it and extract all the `require` calls
    -   Relatively straightforward given what we know about [Acorn][acorn]
    -   Though notice how we build the module so that it can be run from the command line *or* loaded

<%- include('/inc/multi.html', {pat: 'extract-require.*', fill: 'js sh text'}) %>

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

<%- include('/inc/multi.html', {pat: 'transitive-closure-only.*', fill: 'js sh text'}) %>

-   This works...
-   ...but we're not keeping track of the mapping from required names within files to absolute paths
-   So modify transitive closure to construct and return a second structure
    -   Primary keys are the absolute paths to the files being required
    -   Sub-keys are the paths actually used for loading
    -   Values are primary keys

<%- include('/inc/multi.html', {pat: 'transitive-closure.*', fill: 'js sh text'}) %>

## How can we combine multiple files into one file?

-   We could concatenate all of the files into one...
    -   ...but we would have name collisions...
    -   ...and `requires` and `module.exports` wouldn't work
-   So read the source file...
    -   ...and eval it with our own `requires` and `module.exports` in place
-   Our `requires` will use the absolute path of the file calling it and the path given to `require`
    and look up the absolute path of the file to load
-   We will create a `modules` object so that code can assign to `module.exports`,
    then take whatever is assigned to it and save it for future `require` calls
-   It's a lot of bookkeeping, but unavoidable

FIXME: diagram

-   First step is to load all the code and signal that we don't have its exports yet

<%- include('/inc/code.html', {file: 'load-code.js'}) %>

-   Next is to get things to work without worrying about circular dependencies
