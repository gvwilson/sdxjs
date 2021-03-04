---
---

<span x="file-interpolator"></span> showed how to use `eval` to load code dynamically.
We can use this to build our own version of JavaScript's `require` function
(the predecessor to `import`).
Our function will take the name of a source file as an argument
and return whatever that file exports.
The key requirement for such a function is to avoid accidentally overwriting things:
if we just `eval` some code and it happens to assign to a variable called `x`,
anything called `x` already in our program might be overwritten.
We therefore need a way to <span g="encapsulate">encapsulate</span> the contents of what we're loading.
Our approach is based on <cite>Casciaro2020</cite>,
which contains a lot of other useful information as well.

## How can we implement namespaces?

A <span g="namespace">namespace</span> is a collection of names in a program
that are isolated from other namespaces.
Most modern languages provide namespaces as a built-in feature
so that programmers don't accidentally step on each other's toes.
JavaScript doesn't,
so we have to implement them ourselves.

We can do this using <span g="closure">closures</span>.
Every function is a namespace:
variables defined inside the function are distinct from variables defined outside it
(<span f="module-loader-closures"></span>).
If we create the variables we want to manage inside a function,
then defined another function inside the first
and return that <span g="inner_function">inner function</span>,
that inner function will be the only thing with references to those variables.

{% include figure id='module-loader-closures' img='figures/closures.svg' alt='How closures work' cap='Using closures to create private variables.' %}

For example,
let's create a function that always appends the same string to its argument:

{% include file file='manual-namespacing.js' %}

{: .continue}
When we run it,
the value that was assigned to the parameter `suffix` still exists
but can only be reached by the inner function:

{% include file file='manual-namespacing.out' %}

We could require every module to define a setup function like this for users to call,
but thanks to `eval` we can wrap the file's contents in a function and call it automatically.
To do this we will create something called an <span g="iife">immediately-invoked function expression</span> (IIFE).
The syntax `() => {...}` defines a function.
If we put the definition in parentheses and then put another pair of parentheses right after it:

```js
(() => {...})()
```

{: .continue}
we have code that defines a function of no arguments and immediately calls it.
We can use this trick to achieve the same effect as the previous example in one step:

{% include multi pat='automatic-namespacing.*' fill='js out' %}

<div class="callout" markdown="1">

### Unconfusing the parser

The extra parentheses around the original definition force the parser to evaluate things in the right order;
if we write:

```js
() => {...}()
```


{: .continue}
then JavaScript interprets it as a function definition followed by an empty expression
rather than an immediate call to the function just defined.

</div>

## How can we load a module?

We want the module we are loading to export names by assigning to `module.exports` just as `require` does,
so we need to provide an object called `module` and create a IIFE.
(We will handle the problem of the module loading other modules later.)
Our `loadModule` function takes a filename and returns a newly-created module object;
the parameter to the function we build and `eval` must be called `module` so that we can assign to `module.exports`.
For clarity,
we call the object we pass in `result` in `loadModule`.

{% include file file='load-module-only.js' %}

{% include figure id='module-loader-iife' img='figures/iife.svg' alt='Implementing modules with IIFEs' cap='Using IIFEs to encapsulate modules and get their exports.' %}

<span f="module-loader-iife"></span> shows the structure of our loader so far.
We can use this code as a test:

{% include file file='small-module.js' %}

{: .continue}
and this short program to load the test and check its exports:

{% include multi pat='test-load-module-only.*' fill='js sh out' %}

## Do we need to handle circular dependencies?

What if the code we are loading loads other code?
We can visualize the network of who requires whom as a <span g="directed_graph">directed graph</span>:
if X requires Y,
we draw an arrow from X to Y.
Unlike the directed *acyclic* graphs we met in <span x="build-manager"></span>,
though,
these graphs can contain cycles:
we say a <span g="circular_dependency">circular dependency</span> exists
if X depends on Y and Y depends on X
either directly or indirectly.
This may seem nonsensical,
but can easily arise with <span g="plugin_architecture">plugin architectures</span>:
the file containing the main program loads an extension,
and that extension calls utility functions defined in the file containing the main program.

Most compiled languages can handle circular dependencies easily:
they compile each module into low-level instructions,
then link those to resolve dependencies before running anything
(<span f="module-loader-circularity"></span>).
But interpreted languages usually run code as they're loading it,
so if X is in the process of loading Y and Y tries to call X,
X may not (fully) exist yet.

{% include figure id='module-loader-circularity' img='figures/circularity.svg' alt='Circularity test case' cap='Testing circular imports.' %}

Circular dependencies work in [Python][python], sort of.
Let's create two files called `major.py` and `minor.py`:

{% include file file='checking/major.py' %}
{% include file file='checking/minor.py' %}

Loading fails when we run `major.py` from the command line:

{% include file file='checking/py-command-line.out' %}

{: .continue}
but works in the interactive interpreter:

{% include file file='checking/py-interactive.out' %}

The equivalent test in JavaScript also has two files:

{% include file file='checking/major.js' %}
{% include file file='checking/minor.js' %}

{: .continue}
It fails on the command line:

{% include file file='checking/js-command-line.out' %}

{: .continue}
and also fails in the interactive interpreter
(which is more consistent):

{% include file file='checking/js-interactive.out' %}

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
because someone might create an <span g="alias">alias</a>
and call `require` through that
or `eval` a string that contains a `require` call.
(Of course, they can also do these things with the function version of `import`…)

</div>

## How can a module load another module?

While we're not going to handle circular dependencies,
modules do need to be able to load other modules.
To enable this,
we need to provide the module with a function called `require`
that it can call as it's loading.
As in <span x="file-interpolator"></span>,
this function checks a cache
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
We will use <span g="absolute_path">absolute paths</span> as cache keys
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
the entire implementation of `need` is just {% include linecount file='need.js' %} lines long:

{% include file file='need.js' %}

We now need to modify `loadModule` to take our function `need` as a parameter.
(Again, we'll have our modules call `need('something.js')` instead of `require('something')` for clarity.)
Let's test it with the same small module that doesn't need anything else to make sure we haven't broken anything:

{% include multi pat='test-need-small-module.*' fill='js out' %}

What if we test it with a module that *does* load something else?

{% include file file='large-module.js' %}
{% include multi pat='test-need-large-module.*' fill='js out' %}

This doesn't work because `import` only works at the top level of a program,
not inside a function.
Our system can therefore only run loaded modules by `need`ing them:

{% include file file='large-needless.js' %}
{% include multi pat='test-need-large-needless.*' fill='js out' %}

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