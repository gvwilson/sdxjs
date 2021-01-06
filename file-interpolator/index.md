---
---

Many of our examples are too long to show comfortably in one block of code on a printed page.
As an experiment,
we wrote a custom <g key="loader">loader</a>
that reads a source file with specially-formatted comments
and then reads and inserts the files specified in those comments
(<f key="file-interpolator-conceptual"></f>).
This isn't how modern programming languages manage multi-file programs,
but C and C++ do this with <g key="header_file">header files</g>,
and page templating systems (<x key="page-templates"></x>) do this
to share fragments of HTML.

<%- include('/inc/fig.html', {
    id: 'file-interpolator-conceptual',
    img: '/static/tools-small.jpg',
    alt: 'Using file inclusions',
    cap: 'Including fragments of code to create runnable programs.',
    fixme: true
}) %>

The special comments in our source files contain two fields:
the text to put in the displayed version
and file to include when loading:

<%- include('/inc/file.html', {file: 'interpolation-example.js'}) %>

Spoiler alert:
we got this to work,
then decided to use a different approach for managing the source code fragments in this book.
The stumbling block was that the style-checking tool [ESLint][eslint]
didn't know how to handle our inclusions
so we would either have to modify it or build a style checker of our own.
(We will actually do that in <x key="style-checker"></x>,
but we won't go nearly as far as [ESLint][eslint].)
There are some useful lessons in how we built the inclusion tool despite that,
particularly related to turning source code into something that will run.

## How can we evaluate JavaScript dynamically?

We want to load a file dynamically just like `import` does,
but display the special comments in our web/print versions rather than the interpolated code.
To do this,
we need to understand the <g key="lifecycle">lifecycle</g> of a JavaScript program.
When we ask for a file,
[Node][nodejs] reads the text,
translates it into runnable instructions,
and runs those instructions.
We can do the second and third steps whenever we want using a function called `eval`,
which takes a string as input and executes it as if it were part of the program
(<f key="file-interpolator-eval"></f>).

<%- include('/inc/fig.html', {
    id: 'file-interpolator-eval',
    img: '/static/tools-small.jpg',
    alt: 'How eval works',
    cap: '<code>eval</code> vs. normal translation and execution.',
    fixme: true
}) %>

::: callout
### This is not a good idea

`eval` is a security risk:
arbitrary code can do arbitrary things,
so if we take a string typed in by a user and execute it without any checks
it could email our bookmark list to villains all over the world,
erase our hard drive,
or do anything else that code can do (which is pretty much anything).
Browsers do their best to run code in a <g key="sandbox">sandbox</g> for safety,
but [Node][nodejs] doesn't,
so it's up to us to be very (very) careful.
:::

To see `eval` in action,
let's evaluate an expression:

<%- include('/inc/multi.html', {pat: 'eval-two-plus-two.*', fill: 'js out'}) %>

::: continue
Notice that the input to `eval` is *not* `2 + 2`,
but rather a string containing the digit 2,
a space,
a plus sign,
another space,
and another 2.
When we call `eval`,
it translates this string
using exactly the same parser that [Node][nodejs] uses for our program
and immediately runs the result.
:::

We can make the example a little more interesting
by constructing the string dynamically:

<%- include('/inc/multi.html', {pat: 'eval-loop.*', fill: 'js out'}) %>

::: continue
The first time the loop runs the string is `'x + 1'`;
since there's a variable called `x` in scope,
`eval` does the addition and we print the result.
The same thing happens for the variables `y` and `z`,
but we get an error when we try to evaluate the string `'oops + 1'`
because there is no variable in scope called `oops`.
:::

`eval` can use whatever variables are in scope when it's called,
but what happens to any variables it defines?
This example creates a variable called `x` and runs `console.log` to display it,
but as the output shows,
`x` is local to the `eval` call
just as variables created inside a function
only exist during a call to that function:

<%- include('/inc/multi.html', {pat: 'eval-local-vars.*', fill: 'js out'}) %>

However,
`eval` can modify variables outside the text
in the same way that a function can modify global variables:

<%- include('/inc/multi.html', {pat: 'eval-global-vars.*', fill: 'js out'}) %>

::: continue
So if the text we give to `eval` modifies a structure that is defined outside the text,
that change outlives the call to `eval`
(<f key="file-interpolator-global"></f>):
:::

<%- include('/inc/multi.html', {pat: 'eval-global-structure.*', fill: 'js out'}) %>

<%- include('/inc/fig.html', {
    id: 'file-interpolator-global',
    img: '/static/tools-small.jpg',
    alt: 'Modifying a global structure',
    cap: 'How <code>eval</code> modifies a structure defined globally.',
    fixme: true
}) %>

The examples so far have all evaluated strings embedded in the program itself,
but `eval` doesn't care where its input comes from.
Let's move the code that does the modifying into `to-be-loaded.js`:

<%- include('/inc/file.html', {file: 'to-be-loaded.js'}) %>

::: continue
This doesn't work on its own because `Seen` isn't defined:
:::

<%- include('/inc/file.html', {file: 'to-be-loaded.out'}) %>

::: continue
But if we read the file and `eval` the text *after* defining `Seen`,
it does what we want:
:::

<%- include('/inc/multi.html', {pat: 'does-the-loading.*', fill: 'js sh out'}) %>

## How can we manage files?

The source files in this book are small enough
that we don't have to worry about reading them repeatedly,
but in larger systems or when there are network delays
we would like to avoid doing unnecessary work.
The usual approach is to create a <g key="cache">cache</g>
using the <g key="singleton_pattern">Singleton</g> pattern
that we first met in <x key="unit-test"></x>.
Whenever we want to read a file,
we check to see if it's already in the cache
(<f key="file-interpolator-cache"></f>).
If so,
we use that copy;
if not,
we read it and add it to the cache
using the file path as a lookup key.

<%- include('/inc/fig.html', {
    id: 'file-interpolator-cache',
    img: '/static/tools-small.jpg',
    alt: 'Implementing a cache as a singleton',
    cap: 'Using the Singleton pattern to implement a cache of loaded files.',
    fixme: true
}) %>

We can write a simple cache in just a few lines of code:

<%- include('/inc/file.html', {file: 'need-simple.js'}) %>

Since we are using `eval`, though,
we can't rely on `export` to make things available to the rest of the program.
Instead,
we rely on the fact that the result of an `eval` call is the value of
the last expression evaluated.
Since a variable name on its own evaluates to the variable's value,
we can create a function and then use its name
to "export" it from the evaluated file:

<%- include('/inc/file.html', {file: 'import-simple.js'}) %>

To test our program,
we load the implementation of the cache using `import`,
then use it to load and evaluate another file.
This example expects that "other file" to define a function,
which we call in order to show that everything is working:

<%- include('/inc/multi.html', {pat: 'test-simple.*', fill: 'js sh'}) %>

While each of the files we read in our code interpolation example will probably be unique,
page templating systems often want to read the same file from multiple places.
We could specify everything using relative paths,
but another option is to give our program a <g key="search_path">search path</g>,
i.e.,
a list of directories to look in for the things it needs.
Many programs use search paths,
including [Node][nodejs] itself;
by convention,
they are written as a colon-separated list of directories on Unix
or using semi-colons on Windows.
If a path starts with `./`,
we look for it locally,
and if not,
we go through the directories in the search path in order
until we find a file with a matching name
(<f key="file-interpolator-search-path"></f>).

<%- include('/inc/fig.html', {
    id: 'file-interpolator-search-path',
    img: '/static/tools-small.jpg',
    alt: 'Implementing a search path',
    cap: 'Using a colon-separated list of directories as a search path.',
    fixme: true
}) %>

:::
### That's just how it is

The rules about search paths in the paragraph above are a convention:
somebody did it this way years ago
and (almost) everyone has imitated it since.
It could have been done many other ways,
and there's no guarantee that any particular application does it exactly this way;
it's just how it is.
:::

Since the cache is responsible for finding files,
let's teach it about search paths.
The outline of the class stays the same:

<%- include('/inc/erase.html', {file: 'need-path.js', key: 'skip'}) %>

To get the search path,
we look for the <g key="shell_variable">shell variable</g> `NEED_PATH`.
(Writing shell variables' names in upper case is another convention.)
If `NEED_PATH` exists,
we split it on colons to create a list of directories:

<%- include('/inc/keep.html', {file: 'need-path.js', key: 'search'}) %>

When the time comes to find a file we check to see if the path is local,
and if it's not,
we try the directories in order:

<%- include('/inc/keep.html', {file: 'need-path.js', key: 'search'}) %>

To test this,
we put the file to import in a subdirectory called `modules`:

<%- include('/inc/file.html', {file: 'modules/imported-left.js'}) %>

::: continue
and then put the file doing the importing in the current directory:
:::

<%- include('/inc/file.html', {file: 'test-import-left.js'}) %>

We now need to set the variable `NEED_PATH`.
There are many ways to do this in shell;
if we only need the variable to exist for a single command,
the simplest is to write it as:

```shell
NAME=value command
```

Here's the shell command that runs out test case,
using `$PWD` to get the current working directory:

<%- include('/inc/multi.html', {pat: 'test-import-left.*', fill: 'sh out'}) %>

Now let's create a second importable file in the `modules` directory:

<%- include('/inc/file.html', {file: 'modules/imported-right.js'}) %>

::: continue
and load that twice to check that caching works:
:::

<%- include('/inc/multi.html', {pat: 'test-import-right.*', fill: 'js out'}) %>

## How can we interpolate pieces of code?

Now that all this machinery is in place,
interpolating files is straightforward.
We modify `Cache.find` to return a directory and a file path,
then add an `interpolate` method to replace special comments:

<%- include('/inc/file.html', {file: 'caching.js'}) %>

We can now have a file like this:

<%- include('/inc/file.html', {file: 'import-interpolate.js'}) %>

::: continue
and subfiles like this:
:::

<%- include('/inc/file.html', {file: 'import-interpolate-topmethod.js'}) %>

::: continue
and this:
:::

<%- include('/inc/file.html', {file: 'import-interpolate-bottommethod.js'}) %>

Let's test it:

<%- include('/inc/multi.html', {pat: 'test-import-interpolate.*', fill: 'sh out'}) %>

Here's what happens when this program runs:

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

<%- include('/inc/fig.html', {
    id: 'file-interpolator-lifecycle',
    img: '/static/tools-small.jpg',
    alt: 'File interpolation lifecycle',
    cap: 'The interpolate-translate-run lifecycle.',
    fixme: true
}) %>

This works,
but as we said in the introduction we decided not to use it
because it didn't work *with other tools*.
No piece of software exists in isolation;
when we are evaluating a design,
we always have to ask how it fits into everything else we have.

::: callout
### What we did instead

Rather than interpolating file fragments,
we extract or erase parts of complete (valid) JavaScript files
based on specially-formatted comments,
like the "fragment" comment pair shown below.

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
:::
