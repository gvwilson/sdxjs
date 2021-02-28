---
---

JavaScript was designed in a hurry 25 years ago to make web pages interactive.
Nobody realized it would become one of the most popular programming languages in the world,
which means it didn't include support for things that large programs need.
One of those was a way to turn many easy-to-edit source files into a single easy-to-load file
so that browsers could get what they needed with a single request.

A <span g="module_bundler">module bundler</span> finds all the files that an application depends on
and combines them into a single loadable file
(<span f="module-bundler-bundling"></span>).
This file is much more efficient to load---it's the same number of bytes
but just one network request---and bundling files ensures that dependencies actually resolve.

{% include figure id='module-bundler-bundling' img='figures/bundling.svg' alt='Bundling modules' cap='Combining multiple modules into one.' %}

Bundling requires an <span g="entry_point">entry point</span>,
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

{% include file file='single/main.js' %}
{% include file file='expected-single.out' %}

In our second test case,
`main.js` requires `other.js`,
which doesn't require anything.
The main file is:

{% include file file='simple/main.js' %}

{: .continue}
and the required file is:

{% include file file='simple/main.js' %}

{: .continue}
The output we expect is:

{% include file file='expected-simple.out' %}

Our third test case has multiple inclusions in multiple directories
and is shown in <span f="module-bundler-complicated"></span>:

-   `./main` requires all four of the files below.
-   `./top-left` doesn't require anything.
-   `./top-right` requires `top-left` and `bottom-right`.
-   `./subdir/bottom-left` also requires `top-left` and `bottom-right`.
-   `./subdir/bottom-right` doesn't require anything.

{% include figure id='module-bundler-complicated' img='figures/complicated.svg' alt='Module bundler dependencies' cap='Dependencies in large module bundler test case.' %}

{: .continue}
The main program is:

{% include file file='full/main.js' %}

{: .continue}
and the other four files use `require` and `module.exports`.
The output we expect is:

{% include file file='expected-full.out' %}

We do not handle circular dependencies
because `require` itself doesn't (<span x="module-loader"></span>).

## How can we find dependencies?

To get all the dependencies for one source file,
we parse it and extract all of the calls to `require`.
The code to do this is relatively straightforward given what we know about [Acorn][acorn]:

{% include file file='get-requires.js' %}
{% include multi pat='test-get-requires.*' fill='js sh out' %}

<div class="callout" markdown="1">

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

</div>

To get all of the dependencies our bundle needs
we need to find the <span g="transitive_closure">transitive closure</span> of the entry point's dependencies,
i.e.,
find the set that includes the requirements of the requirements of our requirements and so on.
Our algorithm for doing this uses two sets:
`pending`,
which contains the things we haven't looked at yet,
and `seen`,
which contains the things we have
(<span f="module-bundler-transitive-closure"></span>).
`pending` initially contains the entry point file and `seen` is initially empty.
We keep taking items from `pending` until it is empty.
If the current thing is already in `seen` we do nothing,
while otherwise we get its dependencies and add them to either `seen` or `pending`.

{% include figure id='module-bundler-transitive-closure' img='figures/transitive-closure.svg' alt='Implementing transitive closure' cap='Implementing transitive closure using two sets.' %}

Finding dependencies is complicated by the fact that we can load something under different names,
such as `./subdir/bottom-left` from `main` but `./bottom-left` from `./subdir/bottom-right`.
As with the module loader in <span x="module-loader"></span>,
we use absolute paths as unique identifiers.
Our code is also complicated by the fact that JavaScript's `Set` class doesn't have an equivalent of `Array.pop`,
so we will maintain the set of pending items as a list.
The resulting code is:

{% include file file='transitive-closure-only.js' %}
{% include multi pat='test-transitive-closure-only.*' fill='js sh out' %}

This works,
but it isn't keeping track of the mapping from required names within files to absolute paths,
so when one of the files in our bundle tries to access something,
we might not know what it's after.
The fix is to modify transitive closure to construct and return a two-level structure.
The primary keys are the absolute paths to the files being required,
while sub-keys are the paths they refer to when loading things
(<span f="module-bundler-structure"></span>).

{% include figure id='module-bundler-structure' img='figures/structure.svg' alt='Data structure for modules' cap='Data structure used to map names to absolute paths.' %}

Adding this takes our transitive closure code from
{% include linecount file='transitive-closure-only.js' %} lines
to {% include linecount file='transitive-closure.js' %} lines:

{% include file file='transitive-closure.js' %}
{% include multi pat='test-transitive-closure.*' fill='js sh out' %}

## How can we safely combine several files into one?

We now need to combine all these files into one while keeping each in its own namespace.
We do this using the same method we used in <span x="module-loader"></span>:
wrap the source code in an IIFE
and give it a `module` object to fill in
and an implementation of `require` to resolve dependencies *within the bundle*.
For example, suppose we have this file:

{% include file file='sanity-check-unwrapped.js' %}

{: .continue}
The wrapped version will look like this:

{% include file file='sanity-check-wrapped.js' %}

{: .continue}
And we can test it like this:

{% include multi pat='sanity-check-test.*' fill='js out' %}

We need to do this for multiple files,
so we will put these functions in a lookup table
with their files' absolute paths as its keys.
We will also wrap the loading in a function
so that we don't accidentally step on anyone else's toys:

{% include file file='combine-files.js' %}

Breaking this down,
the code in `HEAD` creates a function of no arguments
while the code in `TAIL` returns the lookup table from that function.
In between,
`combineFiles` adds an entry to the lookup table for each file
(<span f="module-bundler-head-tail"></span>).

{% include figure id='module-bundler-head-tail' img='figures/head-tail.svg' alt='Assembling runnable code' cap='Assembling fragments and modules to create a bundle.' %}

We can test that this works in our two-file case:

{% include file file='test-combine-files.js' %}
{% include file file='test-combine-files-simple.js' %}

{: .continue}
and then load the result and call `initialize`:

{% include file file='show-combine-files-simple.out' %}

## How can files access each other?

The code we have built so far has not yet created our exports;
instead,
it has created a lookup table of functions that can create what we asked for.
More specifically we have

-   a lookup table from absolute filenames to functions that create the exports for those modules;

-   a lookup table from importer's absolute filename to pairs of
    written import name and imported file's absolute filename;
    and

-   an entry point.

To turn this into what we want we look up the function associated with the entry point and run it,
giving it an empty module object and a `require` function that we will describe below,
then get the `exports` from the module object.
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

As in <span x="module-loader"></span> we solve this problem using closures.
We will write a function that takes the two tables as arguments
and returns a function that takes an absolute path identifying this module.
That function returns a function that takes a local path inside a module and returns the exports.
Each of these wrapping layers remembers more information for us
(<span f="module-bundler-returning-functions"></span>),
but we won't pretend that it's easy to trace.

{% include figure id='module-bundler-returning-functions' img='figures/returning-functions.svg' alt='Functions returning functions returning functions' cap='A function that returns functions that return functions.' %}

We also need a third structure:
a cache for the modules we've already loaded.
Putting it all together we have:

{% include file file='create-bundle.js' %}

This code is really hard to read,
both because we have to distinguish what is being printed in the output versus what is being executed right now
and because of the levels of nesting needed to capture variables safely.
Getting this right took much more time per line of finished code than anything we have seen so far
except the promises in <span x="async-programming"></span>.

To prove that this works
we will look up the function `main` in the first file and call it;
if we were loading in the browser,
we'd capture the exports in a variable for later use.
First, we create the bundled file:

{% include file file='test-create-bundle-single.sh' %}
{% include file file='bundle-single.js' %}

{: .continue}
and then we run it:

{% include file file='test-bundle-single.out' %}

That was a lot of work to print one line,
but what we have should work for other files.
The two-file case with `main` and `other` works:

{% include file file='bundle-simple.js' %}
{% include file file='test-bundle-simple.out' %}

{: .continue}
and so does our most complicated test with `main` and four other files:

{% include file file='test-bundle-full.out' %}
