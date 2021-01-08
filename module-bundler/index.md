---
---

JavaScript was designed in a hurry 25 years ago to make web pages interactive.
Nobody realized it would become one of the most popular programming languages in the world,
which means it didn't include support for things that large programs need.
One of those was a way to turn many easy-to-edit source files into a single easy-to-load file
so that browsers could get what they needed with a single request.

A <g key="module_bundler">module bundler</g> finds all the files that an application depends on
and combines them into a single loadable file
(<f key="module-bundler-bundling"></f>).
This file is much more efficient to load---it's the same number of bytes
but just one network request---and bundling files ensures that dependencies actually resolve.

<%- include('/inc/fig.html', {
    id: 'module-bundler-bundling',
    img: '/static/tools-small.jpg',
    alt: 'Bundling modules',
    cap: 'Combining multiple modules into one.',
    fixme: true
}) %>

Bundling requires an <g key="entry_point">entry point</g>,
i.e.,
a place to start searching for dependencies.
Given that,
it finds all dependencies,
combines them into one file,
and ensures they can find each other correctly once loaded.
The simplest test case is a single file that doesn't require anything else:
if this doesn't work,
nothing else will.
In order to avoid having to parse JavaScript looking for `import` and `export` statements,
we will use the older `require` and `module.exports`.
Our test case and the expected output are:

<%- include('/inc/file.html', {file: 'single/main.js'}) %>
<%- include('/inc/file.html', {file: 'expected-single.out'}) %>

In our second test case,
`main.js` requires `other.js`,
which doesn't require anything.
The main file is:

<%- include('/inc/file.html', {file: 'simple/main.js'}) %>

::: continue
and the required file is:
:::

<%- include('/inc/file.html', {file: 'simple/main.js'}) %>

::: continue
The output we expect is:
:::

<%- include('/inc/file.html', {file: 'expected-simple.out'}) %>

Our third test case has multiple inclusions in multiple directories
and is shown in <f key="module-bundler-complicated"></f>:

-   `./main` requires all four of the files below.
-   `./top-left` doesn't require anything.
-   `./top-right` requires `top-left` and `bottom-right`.
-   `./subdir/bottom-left` also requires `top-left` and `bottom-right`.
-   `./subdir/bottom-right` doesn't require anything.

<%- include('/inc/fig.html', {
    id: 'module-bundler-complicated',
    img: '/static/tools-small.jpg',
    alt: 'Module bundler dependencies',
    cap: 'Dependencies in large module bundler test case.',
    fixme: true
}) %>

::: continue
The main program is:
:::

<%- include('/inc/file.html', {file: 'full/main.js'}) %>

::: continue
and the other four files use `require` and `module.exports`.
The output we expect is:
:::

<%- include('/inc/file.html', {file: 'expected-full.out'}) %>

We do not handle circular dependencies
because `require` itself doesn't (<x key="module-loader"></x>).

## How can we find dependencies?

To get all the dependencies for one source file,
we parse it and extract all of the calls to `require`.
The code to do this is relatively straightforward given what we know about [Acorn][acorn]:

<%- include('/inc/file.html', {file: 'get-requires.js'}) %>
<%- include('/inc/multi.html', {pat: 'test-get-requires.*', fill: 'js sh out'}) %>

::: callout
### An unsolvable problem

The dependency finder shown above gives the right answer for any reasonable JavaScript program,
but not all JavaScript is reasonable.
Suppose creates an alias for `require` and uses that to load other files:

```js
const req = require
const weWillMissThis = req('./other-file')
```

We could try to trace variable assignments to catch cases like these,
but someone could still fool us by writing this:

```js
const clever = eval(`require`)
const weWillMissThisToo = clever('./other-file')
```

*There is no general solution to this problem*
other than actually running the code to see what it does.
If you would like to understand why not,
and learn about a pivotal moment in the history of computing,
we highly recommend <cite>Petzold2008</cite>.
:::

To get all of the dependencies our bundle needs
we need to find the <g key="transitive_closure">transitive closure</g> of the entry point's dependencies,
i.e.,
find the set that includes the requirements of the requirements of our requirements and so on.
Our algorithm for doing this uses two sets:
`pending`,
which contains the things we haven't looked at yet,
and `seen`,
which contains the things we have
(<f key="module-bundler-transitive-closer"></f>).
`pending` initially contains the entry point file and `seen` is initially empty.
We keep taking items from `pending` until it is empty.
If the current thing is already in `seen` we do nothing,
while otherwise we get its dependencies and add them to either `seen` or `pending`.

<%- include('/inc/fig.html', {
    id: 'module-bundler-transitive-closure',
    img: '/static/tools-small.jpg',
    alt: 'Implementing transitive closure',
    cap: 'Implementing transitive closure using two sets.',
    fixme: true
}) %>

Finding dependencies is complicated by the fact that we can load something under different names,
such as `./subdir/bottom-left` from `main` but `./bottom-left` from `./subdir/bottom-right`.
As with the module loader in <x key="module-loader"></x>,
we use absolute paths as unique identifiers.
Our code is also complicated by the fact that JavaScript's `Set` class doesn't have an equivalent of `Array.pop`,
so we will maintain the set of pending items as a list.
The resulting code is:

<%- include('/inc/file.html', {file: 'transitive-closure-only.js'}) %>
<%- include('/inc/multi.html', {pat: 'test-transitive-closure-only.*', fill: 'js sh out'}) %>

This works,
but it isn't keeping track of the mapping from required names within files to absolute paths,
so when one of the files in our bundle tries to access something,
we might not know what it's after.
The fix is to modify transitive closure to construct and return a two-level structure.
The primary keys are the absolute paths to the files being required,
while sub-keys are the paths they refer to when loading things
(<f key="module-bundler-structure"></f>).

<%- include('/inc/fig.html', {
    id: 'module-bundler-structure',
    img: '/static/tools-small.jpg',
    alt: 'Data structure for modules',
    cap: 'Data structure used to map names to absolute paths.',
    fixme: true
}) %>

Adding this takes our transitive closure code from
<%- include('/inc/linecount.html', {file: 'transitive-closure-only.js'}) %> lines
to <%- include('/inc/linecount.html', {file: 'transitive-closure.js'}) %> lines:

<%- include('/inc/file.html', {file: 'transitive-closure.js'}) %>
<%- include('/inc/multi.html', {pat: 'test-transitive-closure.*', fill: 'js sh out'}) %>

## How can we safely combine several files into one?

We now need to combine all these files into one while keeping each in its own namespace.
We do this using the same method we used in <x key="module-loader"></x>:
wrap the source code in an IIFE
and give it a `module` object to fill in
and an implementation of `require` to resolve dependencies *within the bundle*.
For example, suppose we have this file:

<%- include('/inc/file.html', {file: 'sanity-check-unwrapped.js'}) %>

::: continue
The wrapped version will look like this:
:::

<%- include('/inc/file.html', {file: 'sanity-check-wrapped.js'}) %>

::: continue
And we can test it like this:
:::

<%- include('/inc/multi.html', {pat: 'sanity-check-test.*', fill: 'js out'}) %>

We need to do this for multiple files,
so we will put these functions in a lookup table
with their files' absolute paths as its keys.
We will also wrap the loading in a function
so that we don't accidentally step on anyone else's toys:

<%- include('/inc/file.html', {file: 'combine-files.js'}) %>

Breaking this down,
the code in `HEAD` creates a function of no arguments
while the code in `TAIL` returns the lookup table from that function.
In between,
`combineFiles` adds an entry to the lookup table for each file
(<f key="module-bundler-head-tail"></f>).

<%- include('/inc/fig.html', {
    id: 'module-bundler-head-tail',
    img: '/static/tools-small.jpg',
    alt: 'Assembling runnable code',
    cap: 'Assembling fragments and modules to create a bundle.',
    fixme: true
}) %>

We can test that this works in our two-file case:

<%- include('/inc/file.html', {file: 'test-combine-files.js'}) %>
<%- include('/inc/file.html', {file: 'test-combine-files-simple.js'}) %>

::: continue
and then load the result and call `initialize`:
:::

<%- include('/inc/file.html', {file: 'show-combine-files-simple.out'}) %>

## How can files access each other?

The code we have built so far has not yet created our exports;
instead,
it has created a lookup table of functions that can create what we asked for.
More specifically we have

-   a map from absolute filenames to functions that create the exports for those modules;

-   a map from absolute filenames to pairs of (written import name, absolute filename); and

-   an entry point.

::: continue
To turn this into what we want we look up the function associated with the entry point and run it,
giving it an empty module object and a `require` function that we will describe below,
then get the `exports` from the module object
(<f key="module-bundler-extract"></f>).
:::

<%- include('/inc/fig.html', {
    id: 'module-bundler-extract',
    img: '/static/tools-small.jpg',
    alt: 'Extracting exports from modules',
    cap: 'Extracting exports names from modules after initialization.',
    fixme: true
}) %>

Our replacement for `require` is only allowed to take one argument
because that's all that JavaScript's `require` takes.
However,
it actually needs four things:
the argument to the user's `require` call,
the absolute path of the file making the call,
and the two lookup tables.
Those two tables can't be global variables because of possible name collisions:
no matter what we call them,
the user might have given a variable the same name.

As in <x key="module-loader"></x> we solve this problem using closures.
We will write a function that takes the two tables as arguments
and returns a function that takes an absolute path identifying this module
and returns a function that takes a local path inside a module and returns the exports.
Each of these wrapping layers remembers more information for us
(<f key="module-bundler-returning-functions"></f>),
but we won't pretend that it's easy to trace.

<%- include('/inc/fig.html', {
    id: 'module-bundler-returning-functions',
    img: '/static/tools-small.jpg',
    alt: 'Functions returning functions returning functions',
    cap: 'A function that returns functions that return functions.',
    fixme: true
}) %>

We also need a third structure:
a cache for the modules we've already loaded.
Putting it all together we have:

<%- include('/inc/file.html', {file: 'create-bundle.js'}) %>

This code is really hard to read,
both because we have to distinguish what is being printed in the output versus what is being executed right now
and because of the levels of nesting needed to capture variables safely.
Getting this right took much more time per line of finished code than anything we have seen so far
except the promises in <x key="async-programming"></x>.

To prove that this works
we will look up the function `main` in the first file and call it;
if we were loading in the browser,
we'd capture the exports in a variable for later use.
First, we create the bundled file:

<%- include('/inc/file.html', {file: 'test-create-bundle-single.sh'}) %>
<%- include('/inc/file.html', {file: 'bundle-single.js'}) %>

::: continue
and then we run it:
:::

<%- include('/inc/file.html', {file: 'test-bundle-single.out'}) %>

That was a lot of work to print one line,
but what we have should work for other files.
The two-file case with `main` and `other` works:

<%- include('/inc/file.html', {file: 'bundle-simple.js'}) %>
<%- include('/inc/file.html', {file: 'test-bundle-simple.out'}) %>

::: continue
and so does our most complicated test with `main` and four other files:
:::

<%- include('/inc/file.html', {file: 'test-bundle-full.out'}) %>
