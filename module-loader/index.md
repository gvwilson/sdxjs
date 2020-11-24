---
---

-   <xref key="file-interpolator"></xref> showed how to use `eval` to load code dynamically
-   We can use this to build our own version of `require`
    -   Take the name of a source file as an argument
    -   Return whatever that file exports
-   Key requirement is to avoid accidentally overwriting things
    -   If we just `eval` the loaded code and it happens to define a variable called `x`,
        anything called `x` already in our program might be overwritten
-   Our approach is based on <cite>Casciaro2020</cite>

## How can we implement namespaces?

-   A <g key="namespace">namespace</g> is a collection of names in a program that are isolated from other namespaces
    -   Most modern languages provide namespaces as a feature so that programmers don't accidentally step on each other's toes
    -   JavaScript doesn't have this, so we have to implement it ourselves
-   We can create a namespace by:
    -   Defining the things we care about inside a function (which gives us a temporary namespace when it runs)
    -   Having the function return the things we want
-   Gives us code like this:

<%- include('/_inc/multi.html', {pat: 'manual-namespacing.*', fill: 'js out'}) %>

-   We could require every module to define a setup function like this for users to call
-   Or we can wrap this up and call it automatically
    -   `() => {...}` defines a function
    -   `(() => {...})()` defines a function and immediately calls it
    -   The extra parentheses around the original definition force the parser to evaluate things in the right order
    -   This is called an <g key="iife">immediately-invoked function expression</g> (IIFE)

<%- include('/_inc/multi.html', {pat: 'automatic-namespacing.*', fill: 'js out'}) %>

## How can we load a module?

-   We want the module we are loading to export names by assigning to `module.exports`
-   So we need to provide an object called `module` *and* create a IIFE
    -   Handle the problem of the module loading other modules later
-   Our `loadModule` function takes a filename and returns a newly-created module object
    -   The parameter to the function we build and `eval` must be called `module` so that we can assign to `module.exports`
    -   For clarity, we call the object we pass in `result` in `loadModule`

<%- include('/_inc/file.html', {file: 'load-module-only.js'}) %>

-   Use this as a test

<%- include('/_inc/file.html', {file: 'small-module.js'}) %>
<%- include('/_inc/multi.html', {pat: 'test-load-module-only.*', fill: 'js sh out'}) %>

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

<%- include('/_inc/file.html', {file: 'checking/major.py'}) %>
<%- include('/_inc/file.html', {file: 'checking/minor.py'}) %>

-   Fails when run from the command line

<%- include('/_inc/file.html', {file: 'py-command-line.out'}) %>

-   But works in the interactive interpreter

<%- include('/_inc/file.html', {file: 'py-interactive.out'}) %>

-   Equivalent in JavaScript

<%- include('/_inc/file.html', {file: 'checking/major.js'}) %>
<%- include('/_inc/file.html', {file: 'checking/minor.js'}) %>

-   Fails on the command line

<%- include('/_inc/file.html', {file: 'js-command-line.out'}) %>

-   Also fails in the interactive interpreter

<%- include('/_inc/file.html', {file: 'js-interactive.out'}) %>

-   So we will *not* handle circular dependencies
    -   But we *will* detect them and generate a sensible error message

::: callout
### `import` vs. `require`

Circular dependencies actually *do* work JavaScript's newer `import` syntax.
The difference is that we can reliably analyze files to determine what needs what,
get everything into memory,
and then resolve dependencies.
(We can't do this with `require`-based code
because someone might call `require` inside a function
or create an alias and call `require` through that.)
Please see <cite>Casciaro2020</cite> for a more detailed discussion.
:::

## How can a module load another module?

-   We need to provide the module with a function called `require`
    -   Check a cache to see if the file has already been loaded
    -   Load it if it isn't there
    -   Either way, return the result
-   Use absolute paths as cache keys
    -   Suppose `major.js` imports `subdir/minor.js`
    -   When `minor.js` imports `../major.js`, we need to know it's already loaded
-   How to make the cache available?
    -   Make it a property of the `require` function
-   To reduce confusion, we will call our function `need` instead of `require`

<%- include('/_inc/file.html', {file: 'need.js'}) %>

-   Need to modify `loadModule` to take our function `need` as a parameter
    -   Again, we'll have "modules" call `need('something.js')` instead of `require('something')` for clarity
-   Test with the same small module that doesn't need anything else to make sure we haven't broken anything

<%- include('/_inc/multi.html', {pat: 'test-need-small-module.*', fill: 'js out'}) %>

-   Test again with a module that loads something else

<%- include('/_inc/file.html', {file: 'large-module.js'}) %>

<%- include('/_inc/multi.html', {pat: 'test-need-large-module.js', fill: 'js out'}) %>

-   Doesn't work because our made-up function has `need` as a parameter and also as a constant
-   Not a problem with Node because `require` is predefined
-   So we will rely on our loader to provide it
    -   Which means we can only run loaded modules by `need`ing them

<%- include('/_inc/file.html', {file: 'large-needless.js'}) %>

<%- include('/_inc/multi.html', {pat: 'test-need-large-needless.*', fill: 'js out'}) %>
