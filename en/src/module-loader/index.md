---
title: "Module Loader"
---

[%x file-interpolator %] showed how to use `eval` to load code dynamically.
We can use this to build our own version of JavaScript's `require` function.
Our function will take the name of a source file as an argument
and return whatever that file exports.
The key requirement for such a function is to avoid accidentally overwriting things:
if we just `eval` some code and it happens to assign to a variable called `x`,
anything called `x` already in our program might be overwritten.
We therefore need a way to [%i "encapsulation" "software design!encapsulation" %][%g encapsulate "encapsulate" %][%/i%] the contents of what we're loading.
Our approach is based on [%b Casciaro2020 %],
which contains a lot of other useful information as well.

## How can we implement namespaces? {: #module-loader-namespace}

A [%i "namespace" %][%g namespace "namespace" %][%/i%] is a collection of names in a program
that are isolated from other namespaces.
Most modern languages provide namespaces as a built-in feature
so that programmers don't accidentally step on each other's toes.
JavaScript doesn't,
so we have to implement them ourselves.

We can do this using [%i "closure" %][%g closure "closures" %][%/i%].
Every function is a namespace:
variables defined inside the function are distinct from variables defined outside it
([%f module-loader-closures %]).
If we create the variables we want to manage inside a function,
then define another function inside the first
and return that [%i "inner function" "function!inner" %][%g inner_function "inner function" %][%/i%],
that inner function will be the only thing with references to those variables.

[% figure
   cls="figure-here"
   slug="module-loader-closures"
   img="closures.svg"
   alt="How closures work"
   caption="Using closures to create private variables."
%]

For example,
let's create a function that always appends the same string to its argument:

[% inc file="manual-namespacing.js" %]

When we run it,
the value that was assigned to the parameter `suffix` still exists
but can only be reached by the inner function:
{: .continue}

[% inc file="manual-namespacing.out" %]

We could require every module to define a setup function like this for users to call,
but thanks to `eval` we can wrap the file's contents in a function and call it automatically.
To do this we will create something called
an [%i "immediately-invoked function expression" %][%g iife "immediately-invoked function expression" %][%/i%] (IIFE).
The syntax `() => {...}` defines a function.
If we put the definition in parentheses and then put another pair of parentheses right after it:

```js
(() => {...})()
```

we have code that defines a function of no arguments and immediately calls it.
We can use this trick to achieve the same effect as the previous example in one step:
{: .continue}

[% inc pat="automatic-namespacing.*" fill="js out" %]

<div class="callout" markdown="1">

### Unconfusing the parser

The extra parentheses around the original definition force the parser to evaluate things in the right order;
if we write:

```js
() => {...}()
```

then JavaScript interprets it as a function definition followed by an empty expression
rather than an immediate call to the function just defined.
{: .continue}

</div>

## How can we load a module? {: #module-loader-load}

We want the module we are loading to export names by assigning to `module.exports` just as `require` does,
so we need to provide an object called `module` and create a IIFE.
(We will handle the problem of the module loading other modules later.)
Our `loadModule` function takes a filename and returns a newly created module object;
the parameter to the function we build and `eval` must be called `module` so that we can assign to `module.exports`.
For clarity,
we call the object we pass in `result` in `loadModule`.

[% inc file="load-module-only.js" %]

[% figure
   slug="module-loader-iife-a"
   img="iife-a.svg"
   alt="Implementing modules with IIFEs (part 1)"
   caption="Using IIFEs to encapsulate modules and get their exports (part 1)."
%]

[% figure
   slug="module-loader-iife-b"
   img="iife-b.svg"
   alt="Implementing modules with IIFEs (part 2)"
   caption="Using IIFEs to encapsulate modules and get their exports (part 2)."
%]

[%f module-loader-iife-a %] and [%f module-loader-iife-b %] show the structure of our loader so far.
We can use this code as a test:

[% inc file="small-module.js" %]

and this short program to load the test and check its exports:
{: .continue}

[% inc pat="test-load-module-only.*" fill="js sh out" %]

## Do we need to handle circular dependencies? {: #module-loader-circular}

What if the code we are loading loads other code?
We can visualize the network of who requires whom as a [%i "directed graph" %][%g directed_graph "directed graph" %][%/i%]:
if X requires Y,
we draw an arrow from X to Y.
Unlike the [%i "directed acyclic graph" %]directed *acyclic* graphs[%/i%] we met in [%x build-manager %],
though,
these graphs can contain cycles:
we say a [%i "circular dependency" %][%g circular_dependency "circular dependency" %][%/i%] exists
if X depends on Y and Y depends on X
either directly or indirectly.
This may seem nonsensical,
but can easily arise with [%i "plugin architecture" "software design!plugin architecture" %][%g plugin_architecture "plugin architectures" %][%/i%]:
the file containing the main program loads an extension,
and that extension calls utility functions defined in the file containing the main program.

Most compiled languages can handle circular dependencies easily:
they compile each module into low-level instructions,
then link those to resolve dependencies before running anything
([%f module-loader-circularity %]).
But interpreted languages usually run code as they're loading it,
so if X is in the process of loading Y and Y tries to call X,
X may not (fully) exist yet.

[% figure
   slug="module-loader-circularity"
   img="circularity.svg"
   alt="Circularity test case"
   caption="Testing circular imports."
%]

Circular dependencies work in [%i "Python" %][Python][python][%/i%],
but only sort of.
Let's create two files called `major.py` and `minor.py`:

[% inc file="checking/major.py" %]
[% inc file="checking/minor.py" %]

Loading fails when we run `major.py` from the command line:

[% inc file="checking/py-command-line.out" %]

but works in the interactive interpreter:
{: .continue}

[% inc file="checking/py-interactive.out" %]

<div class="pagebreak"></div>

The equivalent test in JavaScript also has two files:

[% inc file="checking/major.js" %]
[% inc file="checking/minor.js" %]

It fails on the command line:
{: .continue}

[% inc file="checking/js-command-line.out" %]

and also fails in the interactive interpreter
(which is more consistent):
{: .continue}

[% inc file="checking/js-interactive.out" %]

We therefore won't try to handle circular dependencies.
However,
we will detect them and generate a sensible error message.

<div class="callout" markdown="1">

### `import` vs. `require`

Circular dependencies work JavaScript's `import` syntax
because we can analyze files to determine what needs what,
get everything into memory,
and then resolve dependencies.
We can't do this with `require`-based code
because someone might create an [%i "alias!during import" "import!alias" %][%g alias "alias" %][%/i%]
and call `require` through that
or `eval` a string that contains a `require` call.
(Of course, they can also do these things with the function version of `import`.)

</div>

## How can a module load another module? {: #module-loader-subload}

While we're not going to handle circular dependencies,
modules do need to be able to load other modules.
To enable this,
we need to provide the module with a function called `require`
that it can call as it loads.
As in [%x file-interpolator %],
this function checks a [%i "cache!of loaded files" %]cache[%/i%]
to see if the file being asked for has already been loaded.
If not, it loads it and saves it;
either way, it returns the result.

Our cache needs to be careful about how it identifies files
so that it can detect duplicates loading attempts that use different names.
For example,
suppose that `major.js` loads `subdir/first.js` and `subdir/second.js`.
When `subdir/second.js` loads `./first.js`,
our system needs to realize that it already has that file
even though the path looks different.
We will use [%g absolute_path "absolute paths" %] as cache keys
so that every file has a unique, predictable key.

To reduce confusion,
we will call our function `need` instead of `require`.
In order to make the cache available to modules while they're loading,
we will make it a property of `need`.
(Remember,
a function is just another kind of object in JavaScript;
every function gets several properties automatically,
and we can always add more.)
Since we're using the built-in `Map` class as a cache,
the entire implementation of `need` is just [% linecount need.js %] lines long:

[% inc file="need.js" %]

We now need to modify `loadModule` to take our function `need` as a parameter.
(Again, we'll have our modules call `need('something.js')` instead of `require('something')` for clarity.)
Let's test it with the same small module that doesn't need anything else to make sure we haven't broken anything:

[% inc pat="test-need-small-module.*" fill="js out" %]

What if we test it with a module that *does* load something else?

[% inc file="large-module.js" %]
[% inc pat="test-need-large-module.*" fill="js out" %]

This doesn't work because `import` only works at the top level of a program,
not inside a function.
Our system can therefore only run loaded modules by `need`ing them:

[% inc file="large-needless.js" %]
[% inc pat="test-need-large-needless.*" fill="js out" %]

<div class="callout" markdown="1">

### "It's so deep it's meaningless"

The programs we have written in this chapter are harder to understand
than most of the programs in earlier chapters
because they are so abstract.
Reading through them,
it's easy to get the feeling that everything is happening somewhere else.
Programmers' tools are often like this:
there's always a risk of confusing the thing in the program
with the thing the program is working on.
Drawing pictures of data structures can help,
and so can practicing with closures
(which are one of the most powerful ideas in programming),
but a lot of the difficulty is irreducible,
so don't feel bad if it takes you a while to wrap your head around it.

</div>

## Exercises {: #module-loader-exercises}

### Counting with closures {: .exercise}

Write a function `makeCounter` that returns a function
that produces the next integer in sequence starting from zero each time it is called.
Each function returned by `makeCounter` must count independently, so:

```js
left = makeCounter()
right = makeCounter()
console.log(`left ${left()`)
console.log(`right ${right()`)
console.log(`left ${left()`)
console.log(`right ${right()`)
```

must produce:
{: .continue}

```txt
left 0
right 0
left 1
right 1
```

### Objects and namespaces {: .exercise}

A JavaScript object stores key-value pairs,
and the keys in one object are separate from the keys in another.
Why doesn't this provide the same level of safety as a closure?

### Testing module loading {: .exercise}

Write tests for `need.js` using Mocha and `mock-fs`.

### Using `module` as a name {: .exercise}

What happens if we define the variable `module` in `loadModule`
so that it is in scope when `eval` is called
rather than creating a variable called `result` and passing that in:

```js
const loadModule = (filename) => {
  const source = fs.readFileSync(filename, 'utf-8')
  const module = {}
  const fullText = `(() => {${source}})()`
  eval(fullText)
  return module.exports
}
```

### Implementing a search path {: .exercise}

Add a search path to `need.js` so that if a module isn't found locally,
it will be looked for in each directory in the search path in order.

### Using a setup function {: .exercise}

Rewrite the module loader so that every module has a function called `setup`
that must be called after loading it to create its exports
rather than using `module.exports`.

### Handling errors while loading {: .exercise}

1.  Modify `need.js` so that it does something graceful
    if an exception is thrown while a module is being loaded.

2.  Write unit tests for this using Mocha.

### Refactoring circularity {: .exercise}

Suppose that `main.js` contains this:

[% inc file="x-refactoring-circularity/main.js" %]

and `plugin.js` contains this:
{: .continue}

[% inc file="x-refactoring-circularity/plugin.js" %]

Refactor this code so that it works correctly while still using `require` rather than `import`.
{: .continue}

### An LRU cache {: .exercise}

A [%g lru_cache "Least Recently Used (LRU) cache" %]
reduces access time while limiting the amount of memory used
by keeping track of the N items that have been used most recently.
For example,
if the cache size is 3 and objects are accessed in the order shown in the first column,
the cache's contents will be as shown in the second column:

| Item | Action           | Cache After Access |
| ---- | ---------------- | ------------------ |
| A    | read A           | [A]                |
| A    | get A from cache | [A]                |
| B    | read B           | [B, A]             |
| A    | get A from cache | [A, B]             |
| C    | read C           | [C, A, B]          |
| D    | read D           | [D, C, A]          |
| B    | read B           | [B, D, C]          |

1.  Implement a function `cachedRead` that takes the number of entries in the cache as an argument
    and returns a function that uses an LRU cache
    to either read files or return cached copies.

2.  Modify `cachedRead` so that the number of items in the cache
    is determined by their combined size
    rather than by the number of files.

### Make functions safe for renaming {: .exercise}

Our implementation of `need` implemented the cache as a property of the function itself.

1.  How can this go wrong?
    (Hint: thing about aliases.)

2.  Modify the implementation to solve this problem using a closure.
