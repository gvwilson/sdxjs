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
-   We can implement namespaces using <g key="closure">closures</g>
    -   Defining the things we care about inside a function (which gives us a temporary namespace when it runs)
    -   Return a data structure that refers to the things we just created
    -   Only way to access those things is via that data structure
-   For example, create a function that always appends the same string to its argument

<%- include('/inc/fig.html', {
    id: 'module-loader-closures',
    img: '/static/tools-small.jpg',
    alt: 'How closures work',
    cap: 'Using closures to create private variables.',
    fixme: true
}) %>

-   Gives us code like this:

<%- include('/inc/multi.html', {pat: 'manual-namespacing.*', fill: 'js out'}) %>

-   We could require every module to define a setup function like this for users to call
-   Or we can wrap this up and call it automatically
    -   `() => {…}` defines a function
    -   `(() => {…})()` defines a function and immediately calls it
    -   The extra parentheses around the original definition force the parser to evaluate things in the right order
    -   This is called an <g key="iife">immediately-invoked function expression</g> (IIFE)

<%- include('/inc/multi.html', {pat: 'automatic-namespacing.*', fill: 'js out'}) %>

## How can we load a module?

-   We want the module we are loading to export names by assigning to `module.exports`
-   So we need to provide an object called `module` *and* create a IIFE
    -   Handle the problem of the module loading other modules later
-   Our `loadModule` function takes a filename and returns a newly-created module object
    -   The parameter to the function we build and `eval` must be called `module` so that we can assign to `module.exports`
    -   For clarity, we call the object we pass in `result` in `loadModule`

<%- include('/inc/fig.html', {
    id: 'module-loader-iife',
    img: '/static/tools-small.jpg',
    alt: 'Implementing modules with IIFEs',
    cap: 'Using IIFEs to encapsulate modules and get their exports.',
    fixme: true
}) %>

<%- include('/inc/file.html', {file: 'load-module-only.js'}) %>

-   Use this as a test

<%- include('/inc/file.html', {file: 'small-module.js'}) %>
<%- include('/inc/multi.html', {pat: 'test-load-module-only.*', fill: 'js sh out'}) %>

## Do we need to handle circular dependencies?

-   We can visualize the network of who requires whom as a <g key="directed_graph">directed graph</g>
    -   If X requires Y, draw an arrow from X to Y
-   A <g key="circular_dependency">circular dependency</g> exists if X depends on Y and Y depends on X
    -   Either directly or indirectly
-   May seem nonsensical, but can easily arise with <g key="plugin_architecture">plugin architectures</g>
    -   File containing main program loads an extension
    -   The extension calls utility functions defined in the file containing the main program
-   Most <g key="compiled_language">compiled languages</g> can handle this
    -   Compile each module into low-level instructions
    -   <g key="link">Link</g> those to resolve dependencies
    -   Then run
-   But <g key="interpreted_language">interpreted languages</g> execute code as it loads
    -   So if X is in the process of loading Y and Y tries to call X,
        X may not (fully) exist yet

<%- include('/inc/fig.html', {
    id: 'module-loader-circularity',
    img: '/static/tools-small.jpg',
    alt: 'Circularity test cases',
    cap: 'Testing circular imports in Python and JavaScript.',
    fixme: true
}) %>

-   It sort-of works in Python
-   Create two files

<%- include('/inc/file.html', {file: 'checking/major.py'}) %>
<%- include('/inc/file.html', {file: 'checking/minor.py'}) %>

-   Fails when run from the command line

<%- include('/inc/file.html', {file: 'checking/py-command-line.out'}) %>

-   But works in the interactive interpreter (!)

<%- include('/inc/file.html', {file: 'checking/py-interactive.out'}) %>

-   Equivalent in JavaScript

<%- include('/inc/file.html', {file: 'checking/major.js'}) %>
<%- include('/inc/file.html', {file: 'checking/minor.js'}) %>

-   Fails on the command line

<%- include('/inc/file.html', {file: 'checking/js-command-line.out'}) %>

-   Also fails in the interactive interpreter

<%- include('/inc/file.html', {file: 'checking/js-interactive.out'}) %>

-   So we will *not* handle circular dependencies
    -   But we *will* detect them and generate a sensible error message

::: callout
### `import` vs. `require`

Circular dependencies work JavaScript's `import` syntax.
The difference is that we can reliably analyze files to determine what needs what,
get everything into memory,
and then resolve dependencies.
We can't do this with `require`-based code
because someone might call `require` inside a function
or create an alias and call `require` through that.
:::

## How can a module load another module?

-   We need to provide the module with a function called `require`
    -   Check a <g key="cache">cache</g> to see if the file has already been loaded
    -   Load it if it isn't there
    -   Either way, return the result
-   Use absolute paths as cache keys
    -   Suppose `major.js` imports `subdir/minor.js`
    -   When `minor.js` imports `../major.js`, we need to know it's already loaded
-   How to make the cache available?
    -   Make it a property of the `require` function
-   To reduce confusion, we will call our function `need` instead of `require`

<%- include('/inc/file.html', {file: 'need.js'}) %>

-   Need to modify `loadModule` to take our function `need` as a parameter
    -   Again, we'll have "modules" call `need('something.js')` instead of `require('something')` for clarity
-   Test with the same small module that doesn't need anything else to make sure we haven't broken anything

<%- include('/inc/multi.html', {pat: 'test-need-small-module.*', fill: 'js out'}) %>

-   Test again with a module that loads something else

<%- include('/inc/file.html', {file: 'large-module.js'}) %>
<%- include('/inc/multi.html', {pat: 'test-need-large-module.*', fill: 'js out'}) %>

-   Doesn't work because `import` only works at the top level, not inside a function
-   So our system can only run loaded modules by `need`ing them

<%- include('/inc/file.html', {file: 'large-needless.js'}) %>
<%- include('/inc/multi.html', {pat: 'test-need-large-needless.*', fill: 'js out'}) %>

<%- include('/inc/fig.html', {
    id: 'module-loader-need',
    img: '/static/tools-small.jpg',
    alt: 'Module loading lifecycle',
    cap: 'Steps in loading multiple modules.',
    fixme: true
}) %>
