---
---

<x key="file-interpolator"></x> showed how to use `eval` to load code dynamically.
We can use this to build our own version of the `require` function
(the predecessor to `import`)
that takes the name of a source file as an argument
and returns whatever that file exports.
The key requirement for such a function is to avoid accidentally overwriting things.
If we just `eval` some code and it happens to define a variable called `x`,
anything called `x` already in our program might be overwritten.
We therefore need a way to <g key="encapsulate">encapsulate</g> the contents of what we're loading.
Our approach is based on <cite>Casciaro2020</cite>,
which contains a lot of other useful information as well.

## How can we implement namespaces?

A <g key="namespace">namespace</g> is a collection of names in a program that are isolated from other namespaces.
Most modern languages provide namespaces as a feature so that programmers don't accidentally step on each other's toes.
JavaScript doesn't have this,
so we have to implement them ourselves.
We can do this using <g key="closure">closures</g>.
Every function is a namespace:
variables defined inside the function are distinct from variables defined outside it
(<f key="module-loader-closure"></f>).
If we create the things we care about inside a function
and return a data structure that refers to the things we just created,
the only way to access those things is via that data structure.

<%- include('/inc/figure.html', {
    id: 'module-loader-closures',
    img: '/static/tools-small.jpg',
    alt: 'How closures work',
    cap: 'Using closures to create private variables.',
    fixme: true
}) %>

For example,
let's create a function that always appends the same string to its argument:

<%- include('/inc/file.html', {file: 'manual-namespacing.js'}) %>

::: continue
When we run it,
the value that was assigned to the local variable `publicValue` inside the function still exists
but is only reachable through the structure that we returned,
while the value we assigned to `privateValue` is gone:
:::

<%- include('/inc/file.html', {file: 'manual-namespacing.js'}) %>

We could require every module to define a setup function like this for users to call,
but thanks to `eval` we can wrap the file's contents in a function and call it automatically.
To do this we will create something called an <g key="iife">immediately-invoked function expression</g> (IIFE).
The syntax `() => {…}` defines a function.
If we put the definition in parentheses and then put another pair of parentheses right after it:

```js
(() => {…})()
```

::: continue
we have code that defines a function of no arguments and immediately calls it.
We can use this trick to achieve the same effect as the previous example in one step:
:::

<%- include('/inc/multi.html', {pat: 'automatic-namespacing.*', fill: 'js out'}) %>

::: callout
### Unconfusing the parser

The extra parentheses around the original definition force the parser to evaluate things in the right order;
if we write:

```js
() => {…}()
```

::: continue
then JavaScript interprets it as a function definition followed by an empty expression
rather than an immediate call to the function just defined.
:::

:::

## How can we load a module?

We want the module we are loading to export names by assigning to `module.exports` just as `require` does,
so we need to provide an object called `module` and create a IIFE.
(We will handle the problem of the module loading other modules later.)
Our `loadModule` function takes a filename and returns a newly-created module object;
the parameter to the function we build and `eval` must be called `module` so that we can assign to `module.exports`.
For clarity,
we call the object we pass in `result` in `loadModule`.

<%- include('/inc/file.html', {file: 'load-module-only.js'}) %>

<%- include('/inc/figure.html', {
    id: 'module-loader-iife',
    img: '/static/tools-small.jpg',
    alt: 'Implementing modules with IIFEs',
    cap: 'Using IIFEs to encapsulate modules and get their exports.',
    fixme: true
}) %>

<f key="module-loader-iife"></f> shows the structure of our loader so far.
We can use this code as a test:

<%- include('/inc/file.html', {file: 'small-module.js'}) %>

::: continue
and this short program to load the test and check its exports:
:::

<%- include('/inc/multi.html', {pat: 'test-load-module-only.*', fill: 'js sh out'}) %>

## Do we need to handle circular dependencies?

What if the code we are loading loads other code?
We can visualize the network of who requires whom as a <g key="directed_graph">directed graph</g>:
if X requires Y,
we draw an arrow from X to Y.
A <g key="circular_dependency">circular dependency</g> exists if X depends on Y and Y depends on X
either directly or indirectly.
This may seem nonsensical,
but can easily arise with <g key="plugin_architecture">plugin architectures</g>:
the file containing the main program loads an extension,
and that extension calls utility functions defined in the file containing the main program.

Most compiled languages can handle circular dependencies easily:
they compile each module into low-level instructions,
then link those to resolve dependencies before running anything
(<f key="module-loader-circularity"></f>).
But interpreted languages may run code as it loads,
so if X is in the process of loading Y and Y tries to call X,
X may not (fully) exist yet.

<%- include('/inc/figure.html', {
    id: 'module-loader-circularity',
    img: '/static/tools-small.jpg',
    alt: 'Circularity test cases',
    cap: 'Testing circular imports in Python and JavaScript.',
    fixme: true
}) %>

Circular dependencies work in Python, sort of.
Let's create two files called `major.py` and `minor.py`:

<%- include('/inc/file.html', {file: 'checking/major.py'}) %>
<%- include('/inc/file.html', {file: 'checking/minor.py'}) %>

Loading fails when we run `major.py` from the command line:

<%- include('/inc/file.html', {file: 'checking/py-command-line.out'}) %>

::: continue
but works in the interactive interpreter:
:::

<%- include('/inc/file.html', {file: 'checking/py-interactive.out'}) %>

The equivalent test in JavaScript also has two files:

<%- include('/inc/file.html', {file: 'checking/major.js'}) %>
<%- include('/inc/file.html', {file: 'checking/minor.js'}) %>

::: continue
It fails on the command line:
:::

<%- include('/inc/file.html', {file: 'checking/js-command-line.out'}) %>

::: continue
and also fails in the interactive interpreter
(which is more consistent):
:::

<%- include('/inc/file.html', {file: 'checking/js-interactive.out'}) %>

We will therefore not try to handle circular dependencies.
However,
we will detect them and generate a sensible error message.

::: callout
### `import` vs. `require`

Circular dependencies work JavaScript's `import` syntax.
The difference is that we can reliably analyze files to determine what needs what,
get everything into memory,
and then resolve dependencies.
We can't do this with `require`-based code
because someone might call `require` inside a function
or create an <g key="alias">alias</a> and call `require` through that.
:::

## How can a module load another module?

While we're not going to handle circular dependencies,
modules do need to be able to load other modules.
To enable this,
we need to provide the module with a function called `require` as it's loading.
As in <x key="file-interpolator"></x>,
this function checks a cache
to see if the file being asked for has already been loaded,
loads it and saves it if necessary,
and either way returns the result.

Suppose that `major.js` loads `subdir/first.js` and `subdir/second.js`.
When `subdir/second.js` loads `./first.js`,
our system needs to realize that it's already in memory.
We will use <g key="absolute_path">absolute paths</g> as cache keys
so that every file has a unique, predictable key.

To reduce confusion,
we will call our function `need` instead of `require`.
In order to make the cache available to modules while they're loading,
we will make it a property of `need`.
Remember,
a function is just another kind of object in JavaScript;
every function gets several properties automatically,
and we can always add more.
Since we're using the built-in `Map` class as a cache,
the entire implementation of `need` is just <%- include('/inc/linecount.html', {file: 'need.js'}) %> lines long:

<%- include('/inc/file.html', {file: 'need.js'}) %>

We now need to modify `loadModule` to take our function `need` as a parameter.
(Again, we'll have our modules call `need('something.js')` instead of `require('something')` for clarity.)
Let's test it with the same small module that doesn't need anything else to make sure we haven't broken anything:

<%- include('/inc/multi.html', {pat: 'test-need-small-module.*', fill: 'js out'}) %>

What if we test it with a module that *does* load something else?

<%- include('/inc/file.html', {file: 'large-module.js'}) %>
<%- include('/inc/multi.html', {pat: 'test-need-large-module.*', fill: 'js out'}) %>

This doesn't work because `import` only works at the top level of a program,
not inside a function.
Our system can therefore only run loaded modules by `need`ing them:

<%- include('/inc/file.html', {file: 'large-needless.js'}) %>
<%- include('/inc/multi.html', {pat: 'test-need-large-needless.*', fill: 'js out'}) %>

<f key="module-loader-need"></f> shows the steps our program goes through as it loads other code.
The full implementation of `require` does more than we do,
but the principles stay the same.

<%- include('/inc/figure.html', {
    id: 'module-loader-need',
    img: '/static/tools-small.jpg',
    alt: 'Module loading lifecycle',
    cap: 'Steps in loading multiple modules.',
    fixme: true
}) %>
