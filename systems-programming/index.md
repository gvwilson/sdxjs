---
---

-   JavaScript is an <g key="asynchronous">asynchronous</g> language
    -   Its designers didn't want browsers to freeze while waiting for data
    -   So any operation that might be slow is implemented as "describe what to do *later* when data is available"
    -   And anything that touches files is slow compared from a CPU's point of view
-   JavaScript's original solution to this problem was hard to understand in programs of even moderate size
    -   So a second layer was added, and then a third
    -   We need to understand all three layers in order to debug things when they go wrong
-   This chapter introduces the first two layers
    -   <xref key="file-backup"></xref> introduces the third
-   This chapter also shows how to load libraries and how to work with files and directories
    -   Because we're going to be doing a lot of both

## How can I list a directory?

-   Let's try listing the contents of a directory the way we would in Python or Java

<%- include('/inc/code.html', {file: 'list-dir-wrong.js'}) %>

-   Use `require(library-name)` to load a library
    -   Returns an object
    -   Assign that to a constant
        -   Allows us to give short nicknames to meaningfully-named libraries
    -   Use `library.component` to refer to things in the library

> **`require` versus `import`**
>
> In 2015, a new version of JavaScript called ES6 introduced the keyword `import` for importing modules.
> It improves on `require` in several ways, but Node still uses `require` by default.
> We can change our settings to use `import` instead,
> but even if we do,
> Node prints a warning message each time we run a program.
> We have therefore decided to stick to `require` in this book.

-   Use the [`fs`][node-fs] library ("fs" is short for "<g key="filesystem">filesystem</g>")
    -   Contains functions to create directories, read or delete files, etc.
-   The program's <g key="command_line_argument">command-line arguments</g> are stored in `process.argv`
    -   `process.argv[0]` is the name of the program used to run our code (in this case `node`)
    -   `process.argv[1]` is the name of our program (in this case `list-dir-wrong.js`)
    -   `process.argv[2]` is the first argument after the name of our program
-   `fs.readdir` is supposed to return an array of strings (the names of the things in the directory)
-   Use `for (const name of results)` to loop over the *contents* of that array
    -   `const name` means "`name` is unchangeable inside the loop"
-   And `console.log` is the equivalent of other languages' `print`
    -   Strange name because its original purpose was to create <g key="log_message">log messages</g> in the browser <g key="console">console</g>

<%- include('/inc/multi.html', {pat: 'list-dir-wrong.*', fill: 'sh text'}) %>

-   Error message comes from something we didn't write whose source we would struggle to read
    -   Our code is the third `at` line (look for the name of our file `list-dir-wrong.js`)
    -   Everything below it is what Node does to load and run our program
-   The problem is that `fs.readdir` doesn't return anything
-   Instead, its [documentation][node-fs] says that it takes a <g key="callback">callback function</g>

## What is a callback function?

-   JavaScript uses a <g key="single_threaded">single-threaded</g> programming model
    -   Any operation that might delay, such as file I/O, is split into "start" and "data ready"
    -   The "start" part is the code we already have
    -   We need to write a function that specifies what we want to do when our data is ready
-   JavaScript saves a reference to this function to call when the data is ready
    -   The function must take a specific set of parameters
    -   A standard <g key="protocol">protocol</g> like the various kind of USB ports and connectors that allows us to plug things together

FIXME: diagram

<%- include('/inc/code.html', {file: 'list-dir-function-defined.js'}) %>

-   Node callbacks always get an error (if any) as their first argument
    -   Use `console.error` to report it for now
    -   Do something more sensible once we understand exceptions
-   The results from successful execution are passed as the other argument (in this case, `files`)

<%- include('/inc/multi.html', {pat: 'list-dir-function-defined.*', fill: 'sh text'}) %>

-   Nothing else in this book will make sense if we don't understand the order of execution
    1.  Read the program file
    2.  Execute the first line to load the `fs` library
    3.  Define a function of two parameters and assign it to `listContents`
        -   Remember, a function is just another kind of data
        -   Instead of being made up of numbers, characters, or pixels, it is made up of instructions
        -   But these are stored in memory like anything else
    4.  Get the name of the directory from the command-line arguments
    5.  Call `fs.readdir` to start a filesystem operation
        -   Tell it what directory we want to read
        -   And what function to call when data is available
    6.  Print a message to show we're at the end of the file
    7.  Wait (this part is invisible)
    8.  Filesystem operation finishes
    9.  Our callback function runs and prints its output

## What are anonymous functions?

-   More idiomatic to define the callback as an <g key="anonymous_function">anonymous function</g> where it's used
    -   Most callbacks are only used in one place, so there's no need to give them names
    -   Makes it easier to see what's going to happen when the operation completes
    -   But takes some getting used to, since the order of execution is now very different from the order of reading.

<%- include('/inc/code.html', {file: 'list-dir-function-anonymous.js'}) %>

## How can we select a set of files?

-   Often want to copy just a subset of files
    -   Include only those listed
    -   Copy everything except those explicitly excluded (the `.gitignore` model)
-   Use the [`glob`][node-glob] module
    -   <g key="globbing">Globbing</g> (short for "global") is an old Unix term for matching a set of files by name
    -   Like most of programming it works by filename, not by actual content type
<%- include('/inc/multi.html', {pat: 'glob-all-files.*', fill: 'js text'}) %>

-   Get filenames matching a pattern and then do something with the list
    -   The leading `**` means "recurse into subdirectories"
    -   The `*.*` means "any characters followed by '.' followed by any characters"
    -   Names that *don't* match `*.*` won't be included
    -   And by default, names that start with `.` (like `.gitignore`) aren't included
-   Works, but we probably don't want to copy editor backup files ending with `~`
-   We can get the list and then <g key="filter">filter</g> those out

<%- include('/inc/multi.html', {pat: 'glob-get-then-filter-pedantic.*', fill: 'js text'}) %>

-   `Array.filter` creates a new array containing all the items of the original that pass the test
    -   The test is specified as a callback function called once for each item that returns a <g key="boolean">Boolean</g>

FIXME: diagram

-   We can make this more idiomatic by:
    -   Removing the parentheses around the single parameter
    -   Writing just the expression we want the function to return

<%- include('/inc/code.html', {file: 'glob-get-then-filter-idiomatic.js'}) %>

-   It turns out that `glob` can filter for us
    -   Its documentation says it has an `options` argument
    -   We can pass an object full of key-value settings to control its behavior
    -   This is another common pattern in Node libraries and in our own code

<%- include('/inc/code.html', {file: 'glob-filter-with-options.js'}) %>

-   Notice that we don't quote the key in this object
    -   The keys in objects are almost always strings
    -   So if that string is simple enough that it won't confuse the parser, we don't need to put quotes around it
    -   "Simple enough" means "only contains letters, digits, and the underscore"
    -   Or equivalently "looks like it could be a variable name"

> **No one knows everything**
>
> We combined `glob.glob` and `Array.filter` in our functions for more than a year
> before someone pointed out the `ignore` option for `glob.glob`.
> This shows:
>
> 1.  Life is short,
>     so most of us find a way to solve the problem in front of us
>     and re-use it rather than looking for something better.
>
> 2.  Code reviews aren't just about finding bugs:
>     they are also the most effective way to transfer knowledge between programmers.
>     Even if someone is much more experienced than you,
>     there's a good chance you might have stumbled over a better way to do something
>     than the one they're using (see point #1 above).

-   Now specify a source directory and fold that into the glob

<%- include('/inc/code.html', {file: 'glob-with-source-directory.js'}) %>

-   This uses <g key="string_interpolation">string interpolation</g>
    -   Back-quote the string
    -   Use `${name}` to insert the value of an expression
    -   This is completely separate from the globbing

## How can we copy a set of files?

-   We now have the <g key="path">paths</g> to the files we are copying
-   So we can take a second argument that specifies an output directory
    -   Construct the output path by replacing the name of the source directory with the name of the output directory

<%- include('/inc/code.html', {file: 'glob-with-dest-directory.js'}) %>

-   This uses <g key="destructuring_assignment">destructuring assignment</g> to create two variables at once
    -   Only works if both source and destination are given on the command line, so we should check that

FIXME: diagram

-   But this only works if the destination directory already exists
    -   `fs` and equivalent libraries in other languages (mostly) won't create the directories we need automatically
-   This comes up so often that there is a function `ensureDir` to do what we need

<%- include('/inc/code.html', {file: 'glob-ensure-output-directory.js'}) %>

-   [`fs-extra`][node-fs-extra] provides some useful utilities on top of `fs`
-   And use [`path`][node-path] to manipulate pathnames because someone else has figured out the string operations needed to handle various cases
-   This code gives us an empty tree of directories
-   Note the name changes
    -   Use `srcRoot` and `destRoot` because we're going to need `destDir`
    -   Yes, this was a bug…
-   We can now copy the files

<%- include('/inc/code.html', {file: 'copy-file-unfiltered.js'}) %>

-   Three levels of callback
    -   When `glob` has data, do things and then call `ensureDir`
    -   When `ensureDir` completes, copy a file
    -   When `copy` finishes, check the error status
-   Trace this for two directories each containing one file

FIXME: diagram

-   It *almost* works

<%- include('/inc/multi.html', {pat: 'copy-file-unfiltered.*', fill: 'sh text'}) %>

-   `node_modules/fs.realpath` is a directory, not a file, but matches our `glob`
    -   Use `fs.stat` to get the properties of something in the filesystem and then check if it's a file
    -   Name is short for "status"

<%- include('/inc/code.html', {file: 'copy-file-filtered.js'}) %>

-   This works…
-   …but four levels of asynchronous callbacks is hard to understand
-   We need a better mechanism

## How can we manage asynchronous execution?

-   Most functions execute in order
    -   `Array.forEach` does something once for each element of an array but doesn't build a new array like `Array.filter`

<%- include('/inc/multi.html', {pat: 'not-callbacks-alone.*', fill: 'js text'}) %>

-   A handful of built-in functions delay execution
    -   `setTimeout` runs a callback after a certain number of milliseconds
    -   First argument is a function of no arguments
    -   Second is the delay

FIXME: diagram

<%- include('/inc/multi.html', {pat: 'callbacks-with-timeouts.*', fill: 'js text'}) %>

-   Setting a timeout of zero defers execution without delay
    -   Which gives something else a chance to run

<%- include('/inc/multi.html', {pat: 'callbacks-with-zero-timeouts.*', fill: 'js text'}) %>

-   We can use this to build a generic <g key="non_blocking_execution">non-blocking function</g>

<%- include('/inc/multi.html', {pat: 'non-blocking.*', fill: 'js text'}) %>

-   Why bother?
    -   Because we may want to give something else a chance to run
-   Node provides `setImmediate` to do this for us
    -   And also `process.nextTick`, which doesn't do quite the same thing

<%- include('/inc/multi.html', {pat: 'set-immediate.*', fill: 'js text'}) %>

## How do promises work?

-   Let's build something better
    -   Based on [Trey Huffine's tutorial][huffine-promises]
-   Create a <g key="class">class</g> called `Pledge`
    -   Because the real thing is called `Promise`, as in, "I promise to do this later"
-   Start by showing how we want to use it

<%- include('/inc/multi.html', {pat: 'use-pledge-motivation.*', fill: 'js text'}) %>

-   Create a new `Pledge` with a callback that takes `resolve` (everything worked) and `reject` (something failed)
    -   That top-level callback does the first part of what we want to do (the part before we expect a delay)
    -   For demonstration purposes, we will use `setTimeout` to defer execution
    -   Then call to `resolve` to trigger whatever comes next
-   Look at the line with `then`
    -   This is a call to a <g key="method">method</g> of the `Pledge` object
    -   Its argument is a callback that gets the value passed to `resolve`
    -   This is where and how we handle the delayed execution.

FIXME: diagram

-   `Pledge`'s <g key="constructor">constructor</g> requires a single function called `action`
-   This function must take take two callbacks as arguments
    -   What to do if the action completes successfully
    -   What to do if it doesn't (i.e., how to handle errors)
    -   `Pledge` will provide both of these callbacks to the action at the right time
-   Give the class two methods:
    -   `then` to enable more actions
    -   `catch` to handle errors
    -   We arbitrarily decide that we can have as many `then`s as we want, but only one `catch`
-   If the action completes successfully, it gives us a value
-   We pass this value to the first `then`, pass the result of that `then` to the second one, etc.
-   If any of them fail, we pass the <g key="exception">exception</g> to the error handler

<%- include('/inc/code.html', {file: 'pledge.js'}) %>

-   There is one unfortunate trick: `bind`.
    -   When we create an object `obj` and call a method `meth`, JavaScript sets `this` inside `meth`
    -   If we use a method as a callback, `this` isn't set
    -   To convert the method to a plain old function with the right `this`, we have to use `bind`
    -   See [the documentation][bind-docs] for details
-   Let's create a pledge and return a value

<%- include('/inc/multi.html', {pat: 'use-pledge-return.*', fill: 'js text'}) %>

-   Why didn't this work?
    1.  We don't use `return` with pledges, we call `resolve` or `reject`
    2.  We haven't done anything that defers execution
-   Our original motivating example got this right…
-   A more complex example showing how to chain things

<%- include('/inc/multi.html', {pat: 'use-pledge-chained.*', fill: 'js text'}) %>

-   And finally an example where we explicitly signal a problem by calling `reject`

<%- include('/inc/multi.html', {pat: 'use-pledge-reject.*', fill: 'js text'}) %>

## How are promises different?

-   Let's rewrite our chained pledge with built-in promises

<%- include('/inc/multi.html', {pat: 'use-promise-chained.*', fill: 'js text'}) %>

-   It's almost the same, but the callbacks run after the main script finishes
-   Common pattern is to return another promise from inside `then`
    -   So the next `then` is called on the returned promise, not on the original promise

<%- include('/inc/multi.html', {pat: 'promise-example.*', fill: 'js text'}) %>

1.  If we use a promisified function from the library, we get a promise for free
2.  If we want to plug in our own asynchronous functions, we need to create promises
3.  If our code can run synchronously, just put it in `then`

## How can we build tools with promises?

-   Use this to build a line-counting program
-   Use the <g key="promisification">promisified</g> version of `fs-extra`
    -   Turns all of the callbacks into promises for us

<%- include('/inc/multi.html', {pat: 'count-lines-single-file.*', fill: 'js sh text'}) %>

> **Character encoding**
>
> A <g key="character_encoding">character encoding</g> specifies how characters are stored as bytes.
> The most widely used is <g key="utf_8">UTF-8</g>,
> which stores characters common in Western European languages in a single byte
> and uses multi-byte sequences for other symbols.
> If we don't specify a character encoding,
> `fs.readFileAsync` gives us an array of bytes rather than an array of characters.

-   We can use `glob-promise` to delay handling the output of `glob`
    -   Use `Promise.all` to handle all the promises in an array
    -   For readability, put the creation of the promise in a separate function

<%- include('/inc/multi.html', {pat: 'count-lines-globbed-files.*', fill: 'js sh text'}) %>

-   But we want to display filenames as well as counts
-   So we construct temporary objects that have the information we need downstream
    -   Use object with named fields instead of array with positional values
    -   It allows us to add or move fields without breaking code quite as often

<%- include('/inc/code.html', {file: 'count-lines-print-filenames.js'}) %>

-   Works until we run into a directory whose name name matches `*.*`
    -   Which we do in `node_modules`
-   Need to use a `stat` call to check if something is a file or not
    -   But `stat` returns a stats object that doesn't include the file's name
    -   So we create a pair to pass down the chain
    -   Use `{filename, stats}` to give the objects keys and values that match up

<%- include('/inc/multi.html', {pat: 'count-lines-with-stat.*', fill: 'js sh text'}) %>

-   Now make a histogram of how many files are of each length
    -   Only look at `.js` files with the `glob`

<%- include('/inc/multi.html', {pat: 'count-lines-histogram.*', fill: 'js sh text'}) %>

-   This is complex, but a lot simpler than it would be if we were using callbacks
-   <xref key="file-backup"></xref> will introduce a third tool that makes this even simpler
-   But first we need to look at how to test code
