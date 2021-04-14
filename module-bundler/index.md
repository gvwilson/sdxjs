---
---

JavaScript was designed in a hurry 25 years ago to make web pages interactive.
Nobody realized it would become one of the most popular programming languages in the world,
so it didn't include support for things that large programs need.
One of those things was a way to turn a set of easy-to-edit source files
into a single easy-to-load file
so that browsers could get what they needed with one request.

A <span g="module_bundler">module bundler</span> finds all the files that an application depends on
and combines them into a single loadable file
(<span f="module-bundler-bundling"/>).
This file is much more efficient to load:
it's the same number of bytes but just one network request.
(See <span t="systems-programming-times"/> for a reminder of why this is important.)
Bundling files also tests that dependencies actually resolve
so that the application has at least a chance of being able to run.

{% include figure
   id='module-bundler-bundling'
   img='figures/bundling.svg'
   alt='Bundling modules'
   cap='Combining multiple modules into one.' %}

Bundling requires an <span g="entry_point">entry point</span>,
i.e.,
a place to start searching for dependencies.
Given that,
it finds all dependencies,
combines them into one file,
and ensures they can find each other correctly once loaded.
The sections below go through these steps one by one.

## What will we use as test cases?

The simplest test case is a single file that doesn't require anything else:
if this doesn't work,
nothing will.
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

<div class="callout" markdown="1">

### Why `require`?

Our tests cases use the old-style `require` function
and assign things that are to be visible outside the module to `module.exports`
rather than using `import` and `export`.
We tried writing the chapter using the latter,
but kept stumbling over whether we were talking about `import` in Node's module loader
or the `import` we were building.
This kind of confusion is common when building programming tools;
we hope that splitting terminology as we have will help.

</div>

Our third test case has multiple inclusions in multiple directories
and is shown in <span f="module-bundler-complicated"/>:

-   `./main` requires all four of the files below.
-   `./top-left` doesn't require anything.
-   `./top-right` requires `top-left` and `bottom-right`.
-   `./subdir/bottom-left` also requires `top-left` and `bottom-right`.
-   `./subdir/bottom-right` doesn't require anything.

{% include figure
   id='module-bundler-complicated'
   img='figures/complicated.svg'
   alt='Module bundler dependencies'
   cap='Dependencies in large module bundler test case.' %}

{: .continue}
The main program is:

{% include file file='full/main.js' %}

{: .continue}
and the other four files use `require` and `module.exports` to get what they need.
The output we expect is:

{% include file file='expected-full.out' %}

We do not handle circular dependencies
because `require` itself doesn't (<span x="module-loader"/>).

## How can we find dependencies?

To get all the dependencies for one source file,
we parse it and extract all of the calls to `require`.
The code to do this is relatively straightforward given what we know about [Acorn][acorn]:

{% include file file='get-requires.js' %}
{% include multi pat='test-get-requires.*' fill='js sh out' %}

<div class="callout" markdown="1">

### An unsolvable problem

The dependency finder shown above gives the right answer for reasonable JavaScript programs,
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
other than running the code to see what it does.
If you would like to understand why not,
and learn about a pivotal moment in the history of computing,
we highly recommend <cite>Petzold2008</cite>.

</div>

To get all of the dependencies a bundle needs
we need to find the <span g="transitive_closure">transitive closure</span> of the entry point's dependencies,
i.e.,
the requirements of the requirements and so on recursively.
Our algorithm for doing this uses two sets:
`pending`,
which contains the things we haven't looked at yet,
and `seen`,
which contains the things we have
(<span f="module-bundler-transitive-closure"/>).
`pending` initially contains the entry point file and `seen` is initially empty.
We keep taking items from `pending` until it is empty.
If the current thing is already in `seen` we do nothing;
otherwise we get its dependencies and add them to either `seen` or `pending`.

{% include figure
   id='module-bundler-transitive-closure'
   img='figures/transitive-closure.svg'
   alt='Implementing transitive closure'
   cap='Implementing transitive closure using two sets.' %}

Finding dependencies is complicated by the fact that we can load something under different names,
such as `./subdir/bottom-left` from `main` but `./bottom-left` from `./subdir/bottom-right`.
As with the module loader in <span x="module-loader"/>,
we use absolute paths as unique identifiers.
Our code is also complicated by the fact that JavaScript's `Set` class doesn't have an equivalent of `Array.pop`,
so we will actually maintain the "set" of pending items as a list.
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
(<span f="module-bundler-structure"/>).

{% include figure
   id='module-bundler-structure'
   img='figures/structure.svg'
   alt='Data structure for modules'
   cap='Data structure used to map names to absolute paths.' %}

Adding this takes our transitive closure code from
{% include linecount file='transitive-closure-only.js' %} lines
to {% include linecount file='transitive-closure.js' %} lines:

{% include file file='transitive-closure.js' %}
{% include multi pat='test-transitive-closure.*' fill='js sh out' %}

{: .continue}
The real cost, though, is the extra complexity of the data structure:
it took a couple of tries to get it right,
and it will be harder for the next person to understand than the original.
Comprehension and maintenance would be a little easier
if we could draw diagrams directly in our source code,
but as long as we insist that our programs be stored in a punchcard-compatible format
(i.e., as lines of text),
that will remain a dream.

## How can we safely combine several files into one?

We now need to combine the files we have found into one
while keeping each in its own namespace.
We do this using the same method we used in <span x="module-loader"/>:
wrap the source code in an IIFE,
giving that IIFE a `module` object to fill in
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
so we will put these IIFEs in a lookup table
that uses the files' absolute paths as its keys.
We will also wrap loading in a function
so that we don't accidentally step on anyone else's toys:

{% include file file='combine-files.js' %}

Breaking this down,
the code in `HEAD` creates a function of no arguments
while the code in `TAIL` returns the lookup table from that function.
In between,
`combineFiles` adds an entry to the lookup table for each file
(<span f="module-bundler-head-tail"/>).

{% include figure
   id='module-bundler-head-tail'
   img='figures/head-tail.svg'
   alt='Assembling runnable code'
   cap='Assembling fragments and modules to create a bundle.' %}

We can test that this works in our two-file case:

{% include file file='test-combine-files.js' %}
{% include file file='test-combine-files-simple.js' %}

{: .continue}
and then load the result and call `initialize`:

{% include file file='show-combine-files-simple.out' %}

## How can files access each other?

The code we have built so far has not created our exports;
instead,
it has build a lookup table of functions that can create what we asked for.
More specifically we have:

-   a lookup table from absolute filenames
    to functions that create the exports for those modules;

-   a lookup table from the importer's absolute filename
    to pairs storing the name of the required file as it was written
    and the required file's absolute filename;
    and

-   an entry point.

To turn this into what we want,
we must look up the function associated with the entry point and run it,
giving it an empty module object and a `require` function that we will describe below,
then get the `exports` it has added to that module object.
Our replacement for `require` is only allowed to take one argument
(because that's all that JavaScript's `require` takes).
However,
it actually needs four things:
the argument to the user's `require` call,
the absolute path of the file making the call,
and the two lookup tables described above.
Those two tables can't be global variables because of possible name collisions:
no matter what we call them,
the user might have given a variable the same name.

As in <span x="module-loader"/> we solve this problem using closures.
The result is probably the most difficult code in this book to understand
because of its many levels of abstraction.
First, we write a function that takes the two tables as arguments
and returns a function that takes an absolute path identifying this module.
When that function is called,
it creates and returns a function that takes a local path inside a module and returns the exports.
Each of these wrapping layers remembers more information for us
(<span f="module-bundler-returning-functions"/>),
but we won't pretend that it's easy to trace.

{% include figure
   id='module-bundler-returning-functions'
   img='figures/returning-functions.svg'
   alt='Functions returning functions returning functions'
   cap='A function that returns functions that return functions.' %}

We also need a third structure:
a cache for the modules we've already loaded.
Putting it all together we have:

{% include file file='create-bundle.js' %}

This code is hard to read
because we have to distinguish what is being printed in the output versus what is being executed right now
and because of the levels of nesting needed to capture variables safely.
Getting this right took much more time per line of finished code than anything we have seen so far
except the promises in <span x="async-programming"/>.
However,
it is all intrinsic complexity:
anything that does what `require` does is going to be equally convoluted.

To prove that our code works
we will look up the function `main` in the first file and call it.
(If we were loading in the browser,
we'd capture the exports in a variable for later use.)
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
