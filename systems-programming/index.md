---
---

The biggest difference between JavaScript and most other programming languages
is that many operations in JavaScript are <g key="asynchronous">asynchronous</g>.
Its designers didn't want browsers to freeze while waiting for data to arrive or for users to click on things,
so operations that might be slow are implemented by describing *now* what to do *later*.
And since anything that touches the hard drive is slow from a processor's point of view,
[Node][nodejs] implements <g key="filesystem">filesystem</g> operations the same way.

Early JavaScript programs used <g key="callback">callback functions</g> to describe asynchronous operations,
but callbacks can be hard to understand even in small programs.
In 2015,
the language's developers standardized a higher-level tool called <g key="promise">promises</g>
to make callbacks a little easier to manage,
and more recently they have added new keywords called `async` and `await` to make it easier still.
We need to understand all three layers in order to debug things when they go wrong,
so this chapter explores callbacks,
while <x key="async-programming"></x> shows how promises and `async`/`await` work.
This chapter also shows how to read and write files and directories with [Node][nodejs]'s standard libraries,
because we're going to be doing that a lot.

## How can we list a directory?

To start,
let's try listing the contents of a directory the way we would in Python or Java:

<%- include('/inc/file.html', {file: 'list-dir-wrong.js'}) %>

::: continue
We use <code>import <em>module</em> from 'source'</code> to load the library <code><em>source</em></code>
and assign its contents to <code><em>module</em></code>.
After that,
we can refer to things in the library using <code><em>module.component</em></code>
just as we refer to things in any other object.
We can use whatever name we want for the module,
which allows us to give short nicknames to libraries with long names;
we will take advantage of this in future chapters.
:::

::: callout
### `require` versus `import`

In 2015, a new version of JavaScript called ES6 introduced the keyword `import` for importing modules.
It improves on the older `require` method in several ways,
but [Node][nodejs] still uses `require` by default.
To tell it to use `import`,
we have added `"type": "module"` at the top level of [Node][nodejs]'s `package.json` file.
:::

Our little program uses the [`fs`][node-fs] library
which contains functions to create directories, read or delete files, etc.
(Its name is short for "filesystem".)
[Node][nodejs] automatically stores the program's <g key="command_line_argument">command-line arguments</g>
in an array called `process.argv`:
`process.argv[0]` is the name of the program used to run our code (in this case `node`),
while `process.argv[1]` is the name of our program (in this case `list-dir-wrong.js`).
The rest of `process.argv` holds whatever arguments we gave at the command line when we ran the program,
so `process.argv[2]` is the first argument after the name of our program (<f key="systems-programming-process-argv"></f>):

<%- include('/inc/figure.html', {
    id: 'systems-programming-process-argv',
    img: './figures/process-argv.svg',
    alt: 'Command-line arguments in `process.argv`',
    cap: 'How Node stores command-line arguments in <code>process.argv</code>.'
}) %>

If we run this program with the name of a directory as its argument,
`fs.readdir` returns the names of the things in that directory as an array of strings.
The program then uses `for (const name of results)` to loop over the contents of that array.
We could use `let` instead of `const`,
but it's good practice to declare things as `const` wherever possible
so that anyone reading the program knows the variable isn't actually going to vary---doing
this reduces the <g key="cognitive_load">cognitive load</g> on people reading the program.
Finally,
`console.log` is JavaScript's equivalent of other languages' `print` command;
its strange name comes from the fact that
its original purpose was to create <g key="log_message">log messages</g> in the browser <g key="console">console</g>.

Unfortunately,
our program doesn't work:

<%- include('/inc/multi.html', {pat: 'list-dir-wrong.*', fill: 'sh out'}) %>

::: continue
The error message comes from something we didn't write whose source we would struggle to read.
If we look for the name of our file (`list-dir-wrong.js`)
we see the error occurred on line 4;
everything above that is inside `fs.readdir`,
while everything below it is [Node][nodejs] loading and running our program.
:::

The problem is that `fs.readdir` doesn't return anything.
Instead,
[its documentation][node-fs] says that it takes a callback function,
so we need to explore those in order to make our program work.

## What is a callback function?

JavaScript uses a <g key="single_threaded">single-threaded</g> programming model:
as the introduction to this lesson said,
it divides operations like file I/O into "please do this" and "do this when you're done".
`fs.readdir` is the first part,
but we need to write a function that specifies the second part.
JavaScript saves a reference to this function
and calls with a specific set of parameters when our data is ready
(<f key="systems-programming-callbacks"></f>).
Those parameters defined a standard <g key="protocol">protocol</g>
for connecting to libraries,
just like the USB standard allows us to plug hardware devices together.

<%- include('/inc/figure.html', {
    id: 'systems-programming-callbacks',
    img: './figures/callbacks.svg',
    alt: 'Running callbacks',
    cap: 'How JavaScript runs callback functions.'
}) %>

This corrected program gives `fs.readdir` a callback function called `listContents`:

<%- include('/inc/file.html', {file: 'list-dir-function-defined.js'}) %>

::: continue
[Node][nodejs] callbacks always get an error (if there is any) as their first argument
and the result of a successful function call as their second.
The function can tell the difference by checking to see if the error argument is `null`.
If it is, the function lists the directory's contents with `console.log`,
otherwise, it uses `console.error` to display the error message.
Let's run the program with the <g key="current_working_directory">current working directory</g>
(written as '.')
as an argument:
:::

<%- include('/inc/multi.html', {pat: 'list-dir-function-defined.*', fill: 'sh slice.out'}) %>

Nothing in this book will make sense if we don't understand
the order in which [Node][node.js] executes the statements in this program
(<f key="systems-programming-execution-order"></f>):

1.  Execute the first line to load the `fs` library.

1.  Define a function of two parameters and assign it to `listContents`.
    Remember, a function is just another kind of data.
    Instead of being made up of numbers, characters, or pixels, it is made up of instructions,
    but these are stored in memory like anything else.

1.  Get the name of the directory from the command-line arguments.

1.  Call `fs.readdir` to start a filesystem operation,
    telling it what directory we want to read and what function to call when data is available.

1.  Print a message to show we're at the end of the file.

1.  Wait until the filesystem operation finishes (this step is invisible).

1.  Run the callback function, which prints the directory listing.

<%- include('/inc/figure.html', {
    id: 'systems-programming-execution-order',
    img: './figures/execution-order.svg',
    alt: 'Callback execution order',
    cap: 'When JavaScript runs callback functions.'
}) %>

## What are anonymous functions?

Most programmers wouldn't define the function `listContents`
and then pass it as a callback.
Instead,
since the callback is only used in one place,
it is more <g key="idiomatic">idiomatic</g>
to define it where it is needed
as an <g key="anonymous_function">anonymous function</g>.
This makes it easier to see what's going to happen when the operation completes,
though it means the order of execution is quite different from the order of reading
(<f key="systems-programming-anonymous-functions"></f>).
Using an anonymous function gives us the final version of our program:

<%- include('/inc/file.html', {file: 'list-dir-function-anonymous.js'}) %>

<%- include('/inc/figure.html', {
    id: 'systems-programming-anonymous-functions',
    img: './figures/anonymous-functions.svg',
    alt: 'Anonymous functions as callbacks',
    cap: 'How and when JavaScript creates and runs anonymous callback functions.'
}) %>

## How can we select a set of files?

Suppose we want to copy some files instead of listing a directory's contents.
Depending on the situation
we might want to copy only those files given on the command line
or all files except some explicitly excluded.
What we *don't* want to have to do is list the files one by one;
instead,
we want to be able to write patterns like `*.js`.

To find files that match patterns like that,
we can use the [`glob`][node-glob] module.
(To <g key="globbing">glob</g> (short for "global") is an old Unix term for matching a set of files by name.)
The `glob` module provides a function that takes a pattern and a callback
and does something with every filename that matched the pattern:

<%- include('/inc/multi.html', {pat: 'glob-all-files.*', fill: 'js slice.out'}) %>

The leading `**` means "recurse into subdirectories";
the `*.*` means "any characters followed by '.' followed by any characters"
(<f key="systems-programming-globbing"></f>).
Names that don't match `*.*` won't be included,
and by default,
neither are names that start with a '.' character.
(This is another old Unix convention:
files and directories whose names have a leading '.'
usually contain configuration information for various programs,
so most commands will leave them alone unless told to do otherwise.)

<%- include('/inc/figure.html', {
    id: 'systems-programming-globbing',
    img: './figures/globbing.svg',
    alt: 'Matching filenames with `glob`',
    cap: 'Using <code>glob</code> patterns to match filenames.'
}) %>

This program works,
but we probably don't want to copy editor backup files whose names end with `~`.
We can get rid of them by <g key="filter">filtering</g> the list that `glob` returns:

<%- include('/inc/multi.html', {pat: 'glob-get-then-filter-pedantic.*', fill: 'js slice.out'}) %>

`Array.filter` creates a new array containing all the items of the original array that pass a test
(<f key="systems-programming-array-filter"></f>).
The test is specified as a callback function
that runs once for each item and returns a <g key="boolean">Boolean</g>
that determines if the item is kept in the new array (`true`) or left out (`false`).
`Array.filter` does not modify the original array,
so we can filter our original list of filenames several times if we want to.

<%- include('/inc/figure.html', {
    id: 'systems-programming-array-filter',
    img: './figures/array-filter.svg',
    alt: 'Using `Array.filter`',
    cap: 'Selecting array elements using <code>Array.filter</code>.'
}) %>

We can make our globbing program more idiomatic by
removing the parentheses around the single parameter
and writing just the expression we want the function to return:

<%- include('/inc/file.html', {file: 'glob-get-then-filter-idiomatic.js'}) %>

However,
it turns out that `glob` will filter for us.
According to its documentation,
the function takes an `options` object full of key-value settings
that can control its behavior.
This is another common pattern in Node libraries and in our own code:
rather than accepting a large number of rarely-used parameters,
a function can take a single object full of settings.
If we use this,
our program becomes:

<%- include('/inc/file.html', {file: 'glob-filter-with-options.js'}) %>

Notice that we don't quote the key in the `options` object.
The keys in objects are almost always strings,
and if a string is simple enough that it won't confuse the parser,
we don't need to put quotes around it.
Here,
"simple enough" means "looks like it could be a variable name",
or equivalently "contains only letters, digits, and the underscore".

::: callout
### No one knows everything

We combined `glob.glob` and `Array.filter` in our functions for more than a year
before someone pointed out the `ignore` option for `glob.glob`.
This shows:

1.  Life is short,
    so most of us find a way to solve the problem in front of us
    and re-use it rather than looking for something better.

2.  Code reviews aren't just about finding bugs:
    they are also the most effective way to transfer knowledge between programmers.
    Even if someone is much more experienced than you,
    there's a good chance you might have stumbled over a better way to do something
    than the one they're using (see point #1 above).
:::

To finish off our globbing program,
let's specify a source directory on the command line and include that in the pattern:

<%- include('/inc/file.html', {file: 'glob-with-source-directory.js'}) %>

::: continue
This program uses <g key="string_interpolation">string interpolation</g>
to insert the value of `srcDir` into a string.
The template string is written in back quotes,
and we use `${expression}` to insert the value of an expression.
We could create the pattern by concatenating strings using
`srcDir + '/**/*.*'`,
but most programmers find the interpolating version easier to read.
:::

## How can we copy a set of files?

We now have a way to create the <g key="path">paths</g> of the files we want to copy.
If our program takes a second argument that specifies the output directory to copy those files to,
it can construct the full output path by replacing the name of the source directory with the name of the output directory.

<%- include('/inc/file.html', {file: 'glob-with-dest-directory.js'}) %>

::: continue
This program uses <g key="destructuring_assignment">destructuring assignment</g> to create two variables at once
by unpacking the elements of an array
(<f key="systems-programming-destructuring-assignment"></f>).
It only works if the array contains enough elements,
i.e.,
if both a source and destination are given on the command line;
we'll add that in the exercises.
:::

<%- include('/inc/figure.html', {
    id: 'systems-programming-destructuring-assignment',
    img: './figures/destructuring-assignment.svg',
    alt: 'Matching values with destructuring assignment',
    cap: 'Assigning many values at once by destructuring.'
}) %>

A more serious problem is that
this program only works if the destination directory already exists:
`fs` and equivalent libraries in other languages usually won't create directories for us automatically.
The need to do this comes up so often that there is a function called `ensureDir` to do what we need:

<%- include('/inc/file.html', {file: 'glob-ensure-output-directory.js'}) %>

Notice that we import from `fs-extra` instead of `fs`;
the [`fs-extra`][node-fs-extra] module provides some useful utilities on top of `fs`.
We also use [`path`][node-path] to manipulate pathnames
rather than concatenating or interpolating strings
because there are a lot of tricky <g key="edge_case">edge cases</g> in pathnames
that the authors of that module have figured out for us.

::: callout
### Using distinct names

We are now calling our command-line arguments `srcRoot` and `dstRoot`
rather than `srcDir` and `dstDir`.
As we were writing this example we used `dstDir` as both
the name of the top-level destination directory (from the command line)
and the name of the particular output directory to create.
JavaScript didn't complain because
every function creates a new <g key="scope">scope</g> for variable definitions,
and it's perfectly legal to give a variable inside a function
the same name as something outside it.
However, "legal" isn't the same thing as "comprehensible";
giving the two variables different names makes the program easier for humans to read.
:::

Our file copying program currently creates an empty tree of destination directories
but doesn't actually copy any files.
Let's add a call to `fs.copy` to do that:

<%- include('/inc/file.html', {file: 'copy-file-unfiltered.js'}) %>

The program now has three levels of callback
(<f key="systems-programming-triple-callback"></f>):

1.  When `glob` has data, do things and then call `ensureDir`.

1.  When `ensureDir` completes, copy a file.

1.  When `copy` finishes, check the error status.

<%- include('/inc/figure.html', {
    id: 'systems-programming-triple-callback',
    img: './figures/triple-callback.svg',
    alt: 'Three levels of callback',
    cap: 'Three levels of callback in the running example.'
}) %>

Our program looks like it should work,
but if we try to copy everything in the directory containing these lessons
we get an error message:

<%- include('/inc/multi.html', {pat: 'copy-file-unfiltered.*', fill: 'sh out'}) %>

The problem is that `node_modules/fs.stat` and `node_modules/fs.walk` match our globbing expression,
but are directories rather than files.
To prevent our program from trying to use `fs.copy` on directories,
we must use `fs.stat` to get the properties of the thing whose name `glob` has given us
and then check if it's a file.
The name "stat" is short for "status",
and since the status of something in the filesystem can be very complex,
`fs.stat` returns [an object with methods that can answer common questions][node-fs-stats].

Here's the final version of our file copying program:

<%- include('/inc/file.html', {file: 'copy-file-filtered.js'}) %>

::: continue
It works,
but four levels of asynchronous callbacks is hard for humans to understand.
The <x key="async-programming">next chapter</x> will introduce a pair of tools
that make code like this easier to read.
:::
