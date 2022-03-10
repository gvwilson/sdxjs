---
template: page
title: "File Interpolator"
lede: "Managing source files that have been broken into pieces"
---

Many of the examples in these lessons are too long
to show comfortably in one block of code on a printed page,
so we needed a way to break them up.
As an experiment,
we wrote a custom <span g="loader" i="module loader">module loader</span>
that reads a source file containing specially-formatted comments
and then reads and inserts the files specified in those comments
before running the code
(<a figure="file-interpolator-conceptual"/>).
Modern programming languages don't work this way,
but <span i="C">C</span> and <span i="C++">C++</span> do this
with <span g="header_file" i="header file!in C and C++">header files</span>,
and <span i="static site generator!header file; header file!static site generator">static site generators</span>
(<a section="page-templates"/>) do this to share fragments of HTML.

<figure id="file-interpolator-conceptual">
  <img src="figures/conceptual.svg" alt="Using file inclusions" />
  <figcaption>Including fragments of code to create runnable programs.</figcaption>
</figure>

The special comments in our source files contain two fields:
the text to put in the displayed version
and file to include when loading:

<div class="include" file="interpolation-example.js" />

We got this to work,
but decided to use a different approach in this book.
The stumbling block was that the style-checking tool <span i="ESLint">[ESLint][eslint]</span>
didn't know what to make of our inclusions,
so we would either have to modify it or build a style checker of our own.
(We will actually do that in <a section="style-checker"/>,
but we won't go nearly as far as ESLint.)

Despite being a dead end,
the inclusion tool is a good way to show
how JavaScript turns source code into something it can execute.
We need to be able to do this in the next couple of chapters,
so we might as well tackle it now.

## How can we evaluate JavaScript dynamically? {#file-interpolator-dynamic}

We want to display files as they are on the web and in print,
but interpolate the files referenced in special comments
when we load things with `import`.
To do this,
we need to understand the lifecycle of a JavaScript program.
When we ask for a file,
[Node][nodejs] reads the text,
translates it into runnable instructions,
and runs those instructions.
We can do the second and third steps whenever we want using a function called `eval`,
which takes a string as input and executes it as if it were part of the program
(<a figure="file-interpolator-eval"/>).

<figure id="file-interpolator-eval">
  <img src="figures/eval.svg" alt="How eval works" />
  <figcaption><code>eval</code> vs. normal translation and execution.</figcaption>
</figure>

> ### This is not a good idea
>
> <span i="eval!insecurity of">`eval`</span> is a security risk:
> arbitrary code can do arbitrary things,
> so if we take a string typed in by a user and execute it without any checks
> it could email our bookmark list to villains all over the world,
> erase our hard drive,
> or do anything else that code can do (which is pretty much anything).
> Browsers do their best to run code in a <span g="sandbox" i="sandbox (for safe execution)">sandbox</span> for safety,
> but Node doesn't,
> so it's up to us to be (very) careful.

To see `eval` in action,
let's evaluate an expression:

<div class="include" pat="eval-two-plus-two.*" fill="js out" />

<!-- continue -->
Notice that the input to `eval` is *not* `2 + 2`,
but rather a string containing the digit 2,
a space,
a plus sign,
another space,
and another 2.
When we call `eval`,
it translates this string
using exactly the same parser that Node uses for our program
and immediately runs the result.

We can make the example a little more interesting
by constructing the string dynamically:

<div class="include" pat="eval-loop.*" fill="js out" />

<!-- continue -->
The first time the loop runs the string is `'x + 1'`;
since there's a variable called `x` in scope,
`eval` does the addition and we print the result.
The same thing happens for the variables `y` and `z`,
but we get an error when we try to evaluate the string `'oops + 1'`
because there is no variable in scope called `oops`.

`eval` can use whatever variables are in scope when it's called,
but what happens to any variables it defines?
This example creates a variable called `x` and runs `console.log` to display it,
but as the output shows,
`x` is local to the `eval` call
just as variables created inside a function
only exist during a call to that function:

<div class="include" pat="eval-local-vars.*" fill="js out" />

However,
`eval` can modify variables defined outside the text being evaluated
in the same way that a function can modify global variables:

<div class="include" pat="eval-global-vars.*" fill="js out" />

<!-- continue -->
This means that
if the text we give to `eval` modifies a structure that is defined outside the text,
that change outlives the call to `eval`:

<div class="include" pat="eval-global-structure.*" fill="js out" />

The examples so far have all evaluated strings embedded in the program itself,
but `eval` doesn't care where its input comes from.
Let's move the code that does the modifying into `to-be-loaded.js`:

<div class="include" file="to-be-loaded.js" />

<!-- continue -->
This doesn't work on its own because `Seen` isn't defined:

<div class="include" file="to-be-loaded.out" />

<!-- continue -->
But if we read the file and `eval` the text *after* defining `Seen`,
it does what we want:

<div class="include" pat="does-the-loading.*" fill="js sh out" />

## How can we manage files? {#file-interpolator-manage}

The source files in this book are small enough
that we don't have to worry about reading them repeatedly,
but we would like to avoid re-reading things unnecessarily
in large systems or when there might be network delays.
The usual approach is to create a <span i="cache!of loaded files">cache</span>
using the <span i="Singleton pattern; design pattern!Singleton">Singleton pattern</span>
that we first met in <a section="unit-test"/>.
Whenever we want to read a file,
we check to see if it's already in the cache
(<a figure="file-interpolator-cache"/>).
If it is,
we use that copy;
if not,
we read it and add it to the cache
using the file path as a lookup key.

<figure id="file-interpolator-cache">
  <img src="figures/cache.svg" alt="Implementing a cache as a singleton" />
  <figcaption>Using the Singleton pattern to implement a cache of loaded files.</figcaption>
</figure>

We can write a simple cache in just a few lines of code:

<div class="include" file="need-simple.js" />

Since we are using `eval`, though,
we can't rely on `export` to make things available to the rest of the program.
Instead,
we rely on the fact that the result of an `eval` call is the value of
the last expression evaluated.
Since a variable name on its own evaluates to the variable's value,
we can create a function and then use its name
to "export" it from the evaluated file:

<div class="include" file="import-simple.js" />

To test our program,
we load the implementation of the cache using `import`,
then use it to load and evaluate another file.
This example expects that "other file" to define a function,
which we call in order to show that everything is working:

<div class="include" pat="test-simple.*" fill="js sh" />

## How can we find files? {#file-interpolator-find}

Each of the files included in our examples is in the same directory as the file including it,
but in C/C++ or a page templating system
we might include a particular file in several different places.
We don't want to have to put all of our files in a single directory,
so we need a way specify where to look for files that are being included.

One option is to use relative paths,
but another option is to give our program
a list of directories to look in.
This is called a <span g="search_path" i="search path">search path</span>,
and many programs use them,
including Node itself.
By convention,
a search path is written as a colon-separated list of directories on Unix
or using semi-colons on Windows.
If the path to an included starts with `./`,
we look for it locally;
if not,
we go through the directories in the search path in order
until we find a file with a matching name
(<a figure="file-interpolator-search-path"/>).

<figure id="file-interpolator-search-path">
  <img src="figures/search-path.svg" alt="Implementing a search path" />
  <figcaption>Using a colon-separated list of directories as a search path.</figcaption>
</figure>

> ### That's just how it is
>
> The rules about search paths in the paragraph above are a convention:
> somebody did it this way years ago
> and (almost) everyone has imitated it since.
> We could implement search paths some other way,
> but as with configuration file formats,
> variable naming conventions,
> and many other things,
> the last thing the world needs is more innovation.

Since the cache is responsible for finding files,
it should also handle the search path.
The outline of the class stays the same:

<div class="include" file="need-path.js" omit="skip" />

To get the search path,
we look for the <span g="shell_variable" i="shell variable (for storing search path); search path!shell variable">shell variable</span> `NEED_PATH`.
(Writing shell variables' names in upper case is another convention.)
If `NEED_PATH` exists,
we split it on colons to create a list of directories:

<div class="include" file="need-path.js" keep="search" />

When we need to find a file we first check to see if the path is local.
If it's not,
we try the directories in the search path in order:

<div class="include" file="need-path.js" keep="search" />

To test this,
we put the file to import in a subdirectory called `modules`:

<div class="include" file="modules/imported-left.js" />

<!-- continue -->
and then put the file doing the importing in the current directory:

<div class="include" file="test-import-left.js" />

We now need to set the variable `NEED_PATH`.
There are many ways to do this in shell;
if we only need the variable to exist for a single command,
the simplest is to write it as:

```shell
NAME=value command
```

<!-- continue -->
right before the command (on the same line).
Here's the shell command that runs our test case
using `$PWD` to get the current working directory:

<div class="include" pat="test-import-left.*" fill="sh out" />

Now let's create a second importable file in the `modules` directory:

<div class="include" file="modules/imported-right.js" />

<!-- continue -->
and load that twice to check that caching works:

<div class="include" pat="test-import-right.*" fill="js out" />

## How can we interpolate pieces of code? {#file-interpolator-interpolate}

Interpolating files is straightforward once we have this machinery in place.
We modify `Cache.find` to return a directory and a file path,
then add an `interpolate` method to replace special comments:

<div class="include" file="caching.js" />

We can now have a file like this:

<div class="include" file="import-interpolate.js" />

<!-- continue -->
and subfiles like this:

<div class="include" file="import-interpolate-topmethod.js" />

<!-- continue -->
and this:

<div class="include" file="import-interpolate-bottommethod.js" />

Let's test it:

<div class="include" pat="test-import-interpolate.*" fill="sh out" />

When this program runs, its <span i="lifecycle!of file interpolation">lifecycle</span> is:

1.  Node starts to run `test-import-interpolate.js`.
1.  It sees the `import` of need-interpolate` so it reads and evaluates that code.
1.  Doing this creates a singleton cache object.
1.  The program then calls `need('./import-interpolate.js')`.
1.  This checks the cache: nope, nothing there.
1.  So it loads `import-interpolate.js`.
1.  It finds two specially-formatted comments in the text…
1.  …so it loads the file described by each one and inserts the text in place of the comment.
1.  Now that it has the complete text, it calls `eval`…
1.  …and stores the result of `eval` (which is a class) in the cache.
1.  It also returns that class.
1.  We then create an instance of that class and call its method.

This works,
but as we said in the introduction we decided not to use it
because it didn't play well with other tools.
No piece of software exists in isolation;
when we evaluate a design,
we always have to ask how it fits into everything else we have.

## What did we do instead? {#file-interpolator-instead}

Rather than interpolating file fragments,
we extract or erase parts of regular JavaScript files
based on specially-formatted comments
like the `<fragment>...</fragment>` pair shown below.

```js
class Example {
  constructor (name) {
    this.name = name
  }

  // <fragment>
  fragment (message) {
    console.log(`${name}: ${message}`)
  }
  // </fragment>
}
```

The code that selects the part of the file we want to display
is part of our page templating system.
It re-extracts code for display every time the web version of this site is built,
which ensures that we always shows what's in the current version of our examples.
However,
this system doesn't automatically update the description of the code:
if we write, "It does X,"
then modify the code to do Y,
our lesson can be inconsistent.
<span g="literate_programming" i="literate programming">Literate programming</span> was invented
to try to prevent this from happening,
but it never really caught on---unfortunately,
most programming systems that describe themselves as "literate" these days
only implement part of <span i="Knuth, Donald">[Donald Knuth's][knuth-donald]</span> original vision.

## Exercises {#file-interpolator-exercises}

### Security concerns {.exercise}

1.  Write a function `loadAndRun` that reads a file, evaluates it, and returns the result.

2.  Create a file `trust-me.js` that prints "nothing happening here" when it is evaluated,
    but also deletes everything in the directory called `target`.

3.  Write tests for this using [`mock-fs`][node-mock-fs].

<!-- continue -->
Please be careful doing this exercise.

### Loading functions {.exercise}

Write a function that reads a file containing single-argument functions like this:

```js
addOne: (x) => x + 1
halve: (x) => x / 2
array: (x) => Array(x).fill(0)
```

<!-- continue -->
and returns an object containing callable functions.

### Registering functions {.exercise}

Write a function that loads one or more files containing function definitions like this:

```js
const double = (x) => {
  return 2 * x
}

EXPORTS.append(double)
```

<!-- continue -->
and returns a list containing all the loaded functions.

### Indenting inclusions {.exercise}

Modify the file inclusion system
so that inclusions are indented by the same amount as the including comment.
For example,
if the including file is:

```js
const withLogging = (args) => {
  /*+ logging call + logging.js +*/
}

withLogging
```

<!-- continue -->
and the included file is:

```js
console.log('first message')
console.log('second message')
```

<!-- continue -->
then the result will be:

```js
const withLogging = (args) => {
  console.log('first message')
  console.log('second message')
}

withLogging
```

<!-- continue -->
i.e., all lines of the inclusion will be indented to match the first.

### Interpolating from subdirectories {.exercise}

Modify the file interpolator so that snippets can be included from sub-directories using relative paths.

### Recursive search for inclusions {.exercise}

1.  Modify the file interpolator so that it searches recursively
    through all subdirectories of the directories on the search path
    to find inclusions.

2.  Explain why this is a bad idea.

### Defining variables {.exercise}

Modify the file inclusion system so that users can pass in a `Map` containing name-value pairs
and have these interpolated into the text of the files being loaded.
To interpolate a value,
the included file must use `@@name@@`.

### Specifying markers {.exercise}

Modify the file inclusion system so that the user can override the inclusion comment markers.
For example, the user should be able to specify that `/*!` and `!*/` be used to mark inclusions.
(This is often used in tutorials that need to show the inclusion markers without them being interpreted.)

### Recursive inclusions {.exercise}

Modify the file interpolator to support recursive includes,
i.e.,
to handle inclusion markers in files that are being included.
Be sure to check for the case of infinite includes.

### Slicing files {.exercise}

Write a function that reads a JavaScript source file
containing specially-formatted comments like the ones shown below
and extracts the indicated section.

```js
const toBeLeftOut = (args) => {
  console.log('this should not appear')
}

// <keepThis>
const toBeKept = (args) => {
  console.log('only this function should appear')
}
// </keepThis>
```

Users should be able to specify any tag they want,
and if that tag occurs multiple times,
all of the sections marked with that tag should be kept.
(This is the approach we took for this book instead of file interpolation.)
