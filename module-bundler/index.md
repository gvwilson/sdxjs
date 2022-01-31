---
template: page.html
---

<span i="JavaScript!hurried design of">JavaScript</span> was designed in a hurry 25 years ago to make web pages interactive.
Nobody realized it would become one of the most popular programming languages in the world,
so it didn't include support for things that large programs need.
One of those things was a way to turn a set of easy-to-edit source files
into a single easy-to-load file
so that browsers could get what they needed with one request.

A <span g="module_bundler" i="module bundler">module bundler</span> finds all the files that an application depends on
and combines them into a single loadable file
(<a figure="module-bundler-bundling"/>).
This file is much more efficient to load:
it's the same number of bytes but just one network request.
(See <a table="systems-programming-times"/> for a reminder of why this is important.)
Bundling files also tests that dependencies actually resolve
so that the application has at least a chance of being able to run.

<figure id="module-bundler-bundling">
  <img src="figures/bundling.svg" alt="Bundling modules" />
  <figcaption>Combining multiple modules into one.</figcaption>
</figure>

Bundling requires an <span g="entry_point" i="entry point (of module); module!entry point">entry point</span>,
i.e.,
a place to start searching for dependencies.
Given that,
it finds all dependencies,
combines them into one file,
and ensures they can find each other correctly once loaded.
The sections below go through these steps one by one.

## What will we use as test cases? {#module-bundler-tests}

The simplest test case is a single file that doesn't require anything else:
if this doesn't work,
nothing will.
Our test case and the expected output are:

<div class="include" file="single/main.js" />
<div class="include" file="expected-single.out" />

In our second test case,
`main.js` requires `other.js`,
which doesn't require anything.
The main file is:

<div class="include" file="simple/main.js" />

<!-- continue -->
and the required file is:

<div class="include" file="simple/main.js" />

<!-- continue -->
The output we expect is:

<div class="include" file="expected-simple.out" />

> ### Why `require`?
>
> Our tests cases use the old-style <span i="require vs. import; import vs. require">`require`</span> function
> and assign things that are to be visible outside the module to `module.exports`
> rather than using `import` and `export`.
> We tried writing the chapter using the latter,
> but kept stumbling over whether we were talking about `import` in Node's module loader
> or the `import` we were building.
> This kind of confusion is common when building programming tools;
> we hope that splitting terminology as we have will help.

Our third test case has multiple inclusions in multiple directories
and is shown in <a figure="module-bundler-complicated"/>:

-   `./main` requires all four of the files below.
-   `./top-left` doesn't require anything.
-   `./top-right` requires `top-left` and `bottom-right`.
-   `./subdir/bottom-left` also requires `top-left` and `bottom-right`.
-   `./subdir/bottom-right` doesn't require anything.

<figure id="module-bundler-complicated">
  <img src="figures/complicated.svg" alt="Module bundler dependencies" />
  <figcaption>Dependencies in large module bundler test case.</figcaption>
</figure>

<!-- continue -->
The main program is:

<div class="include" file="full/main.js" />

<!-- continue -->
and the other four files use `require` and `module.exports` to get what they need.
The output we expect is:

<div class="include" file="expected-full.out" />

We do not handle circular dependencies
because `require` itself doesn't (<a section="module-loader"/>).

## How can we find dependencies? {#module-bundler-find}

To get all the dependencies for one source file,
we parse it and extract all of the calls to `require`.
The code to do this is relatively straightforward given what we know about <span i="Acorn">[Acorn][acorn]</span>:

<div class="include" file="get-requires.js" />
<div class="include" pat="test-get-requires.*" fill="js sh out" />

> ### An unsolvable problem
>
> The dependency finder shown above gives the right answer for reasonable JavaScript programs,
> but not all JavaScript is reasonable.
> Suppose creates an alias for `require` and uses that to load other files:
>
> ```js
> const req = require
> const weWillMissThis = req('./other-file')
> ```
>
> We could try to trace variable assignments to catch cases like these,
> but someone could still fool us by writing this:
>
> ```js
> const clever = eval(`require`)
> const weWillMissThisToo = clever('./other-file')
> ```
>
> *There is no general solution to this problem*
> other than running the code to see what it does.
> If you would like to understand why not,
> and learn about a pivotal moment in the history of computing,
> we highly recommend <cite>Petzold2008</cite>.

To get all of the dependencies a bundle needs
we need to find the <span g="transitive_closure" i="transitive closure">transitive closure</span> of the entry point's dependencies,
i.e.,
the requirements of the requirements and so on recursively.
Our algorithm for doing this uses two sets:
`pending`,
which contains the things we haven't looked at yet,
and `seen`,
which contains the things we have
(<a figure="module-bundler-transitive-closure"/>).
`pending` initially contains the entry point file and `seen` is initially empty.
We keep taking items from `pending` until it is empty.
If the current thing is already in `seen` we do nothing;
otherwise we get its dependencies and add them to either `seen` or `pending`.

<figure id="module-bundler-transitive-closure">
  <img src="figures/transitive-closure.svg" alt="Implementing transitive closure" />
  <figcaption>Implementing transitive closure using two sets.</figcaption>
</figure>

Finding dependencies is complicated by the fact that we can load something under different names,
such as `./subdir/bottom-left` from `main` but `./bottom-left` from `./subdir/bottom-right`.
As with the module loader in <a section="module-loader"/>,
we use absolute paths as unique identifiers.
Our code is also complicated by the fact that JavaScript's `Set` class doesn't have an equivalent of `Array.pop`,
so we will actually maintain the "set" of pending items as a list.
The resulting code is:

<div class="include" file="transitive-closure-only.js" />
<div class="include" pat="test-transitive-closure-only.*" fill="js sh out" />

This works,
but it isn't keeping track of the mapping from required names within files to absolute paths,
so when one of the files in our bundle tries to access something,
we might not know what it's after.
The fix is to modify transitive closure to construct and return a two-level structure.
The primary keys are the absolute paths to the files being required,
while sub-keys are the paths they refer to when loading things
(<a figure="module-bundler-structure"/>).

<figure id="module-bundler-structure">
  <img src="figures/structure.svg" alt="Data structure for modules" />
  <figcaption>Data structure used to map names to absolute paths.</figcaption>
</figure>

Adding this takes our transitive closure code from
<span class="linecount" file="transitive-closure-only.js"/> lines
to <span class="linecount" file="transitive-closure.js"/> lines:

<div class="include" file="transitive-closure.js" />
<div class="include" pat="test-transitive-closure.*" fill="js sh out" />

<!-- continue -->
The real cost, though, is the extra complexity of the data structure:
it took a couple of tries to get it right,
and it will be harder for the next person to understand than the original.
Comprehension and maintenance would be a little easier
if we could draw diagrams directly in our source code,
but as long as we insist that our programs be stored in a punchcard-compatible format
(i.e., as lines of text),
that will remain a dream.

## How can we safely combine several files into one? {#module-bundler-combine}

We now need to combine the files we have found into one
while keeping each in its own namespace.
We do this using the same method we used in <a section="module-loader"/>:
wrap the source code in an <span i="immediately-invoked function expression">IIFE</span>,
giving that IIFE a `module` object to fill in
and an implementation of `require` to resolve dependencies *within the bundle*.
For example, suppose we have this file:

<div class="include" file="sanity-check-unwrapped.js" />

<!-- continue -->
The wrapped version will look like this:

<div class="include" file="sanity-check-wrapped.js" />

<!-- continue -->
And we can test it like this:

<div class="include" pat="sanity-check-test.*" fill="js out" />

We need to do this for multiple files,
so we will put these IIFEs in a lookup table
that uses the files' absolute paths as its keys.
We will also wrap loading in a function
so that we don't accidentally step on anyone else's toys:

<div class="include" file="combine-files.js" />

Breaking this down,
the code in `HEAD` creates a function of no arguments
while the code in `TAIL` returns the lookup table from that function.
In between,
`combineFiles` adds an entry to the lookup table for each file
(<a figure="module-bundler-head-tail"/>).

<figure id="module-bundler-head-tail">
  <img src="figures/head-tail.svg" alt="Assembling runnable code" />
  <figcaption>Assembling fragments and modules to create a bundle.</figcaption>
</figure>

We can test that this works in our two-file case:

<div class="include" file="test-combine-files.js" />
<div class="include" file="test-combine-files-simple.js" />

<!-- continue -->
and then load the result and call `initialize`:

<div class="include" file="show-combine-files-simple.out" />

## How can files access each other? {#module-bundler-access}

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

As in <a section="module-loader"/> we solve this problem using closures.
The result is probably the most difficult code in this book to understand
because of its many levels of abstraction.
First, we write a function that takes the two tables as arguments
and returns a function that takes an absolute path identifying this module.
When that function is called,
it creates and returns a function that takes a local path inside a module and returns the exports.
Each of these wrapping layers remembers more information for us
(<a figure="module-bundler-returning-functions"/>),
but we won't pretend that it's easy to trace.

<figure id="module-bundler-returning-functions">
  <img src="figures/returning-functions.svg" alt="Functions returning functions returning functions" />
  <figcaption>A function that returns functions that return functions.</figcaption>
</figure>

We also need a third structure:
a cache for the modules we've already loaded.
Putting it all together we have:

<div class="include" file="create-bundle.js" />

This code is hard to read
because we have to distinguish what is being printed in the output versus what is being executed right now
and because of the levels of nesting needed to capture variables safely.
Getting this right took much more time per line of finished code than anything we have seen so far
except the promises in <a section="async-programming"/>.
However,
it is all <span i="intrinsic complexity">intrinsic complexity</span>:
anything that does what `require` does is going to be equally convoluted.

To prove that our code works
we will look up the function `main` in the first file and call it.
(If we were loading in the browser,
we'd capture the exports in a variable for later use.)
First, we create the bundled file:

<div class="include" file="test-create-bundle-single.sh" />
<div class="include" file="bundle-single.js" />

<!-- continue -->
and then we run it:

<div class="include" file="test-bundle-single.out" />

That was a lot of work to print one line,
but what we have should work for other files.
The two-file case with `main` and `other` works:

<div class="include" file="bundle-simple.js" />
<div class="include" file="test-bundle-simple.out" />

<!-- continue -->
and so does our most complicated test with `main` and four other files:

<div class="include" file="test-bundle-full.out" />

## Exercises {#module-bundler-exercises}

### Using test-driven development {.exercise}

Suppose we wanted to compress the files being stored by the file backup system in <a section="file-backup"/>
instead of copying them as-is.
What tests would you write before adding this feature in order to ensure that it worked correctly
once it was implemented?

### Finding `import` dependencies {.exercise}

Modify the dependency finder to work with `import` statements instead of `require` calls.

### Track files using hashes {.exercise}

Modify the dependency finder to track files by hashing them instead of relying on paths,
so that if exactly the same file is being required from two locations,
only one copy is loaded.

### Using asynchronous file operations {.exercise}

Modify the dependency finder to use `async` and `await` instead of synchronous file operations.

### Unit testing transitive closure {.exercise}

Write unit tests for the tool that finds the transitive closure of files' requirements
using Mocha and `mock-fs`.
(Rather than parsing JavaScript files in the mock filesystem,
have each file contain only a list of the names of the files it depends on.)

### Exporting multiple functions {.exercise}

Create test cases for the module bundler in which files export more than one function
and fix any bugs in the module bundler that they uncover.

### Checking integrity {.exercise}

Write a function that checks the integrity of the data structure returned by the transitive closure routine,
i.e.,
that makes sure every cross-reference resolves correctly.

### Logging module loading {.exercise}

1.  Write a function called `logLoad` that takes a module name as an argument
    and prints a message using `console.error` saying that the module has been loaded.

2.  Modify the bundle generator to insert calls to this function
    to report when modules are actually loaded.

### Tracing execution {.exercise}

Trace the execution of every function called
when the `main` function in the full bundle is called.

### Making bundles more readable {.exercise}

Modify the bundle creator to make its output more readable,
e.g.,
by adding comments and indentation.
(This does not matter to the computer,
but can help debugging.)
