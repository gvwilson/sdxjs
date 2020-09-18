---
---

-   Goal: show how promises work and how they are implemented

## How can I copy a file tree? {#copy-file-tree}

-   List the contents of a directory (the wrong way).

<%- include('/_inc/code.html', {file: 'list-dir-wrong.js'}) %>

-   Use `require(library-name)` to load a library
    -   Returns an object
    -   Assign that to a constant
        -   Allows us to give short nicknames to meaningfully-named libraries
    -   Use `library.component` to refer to things in the library

<%- include('/_inc/multi.html', {pat: 'list-dir-wrong.*', fill: 'sh text'}) %>

-   Use the [`fs`][node-fs] library
-   `fs.readdir` doesn't return anything
-   [Documentation][node-fs] says that it takes a <g key="callback">callback</g>
-   JavaScript uses a <g key="single_threaded">single-threaded</g> programming model
    -   Any operation that might delay, such as file I/O, is set aside to be run later
-   Rewrite with an explicit function

<%- include('/_inc/code.html', {file: 'list-dir-function-defined.js'}) %>

-   Node callbacks always get an error (if any) as their first argument
    -   Use `console.error` to report it for now
    -   Do something more sensible once we understand exceptions
-   The actual results are passed as the other argument (in this case, `files`)

<%- include('/_inc/multi.html', {pat: 'list-dir-function-defined.*', fill: 'sh text'}) %>

-   More idiomatic to define the callback <g key="anonymous_function">anonymously</g> where it's used

<%- include('/_inc/code.html', {file: 'list-dir-function-anonymous.js'}) %>

-   So how do we get all the files to be copied?
-   Use [`glob`][node-glob]
    -   <g key="globbing">Globbing</g> is an old Unix name (short for "global")
-   Start by getting all filenames
    -   Works by name, not by type
    -   So filenames that *don't* match `*.*` won't be detected

<%- include('/_inc/multi.html', {pat: 'glob-all-files.*', fill: 'js text'}) %>

-   Works, but we probably don't want to copy [Emacs][emacs] backup files (ending with `~`)
-   We can get the list and then <g key="filter">filter</g> those out

<%- include('/_inc/multi.html', {pat: 'glob-get-then-filter-pedantic.*', fill: 'js text'}) %>

-   `Array.filter` creates a new array containing all the items of the original that pass the test
-   We can make this more idiomatic by:
    -   Removing the parentheses around the single parameter
    -   Writing a naked expression

<%- include('/_inc/code.html', {file: 'glob-get-then-filter-idiomatic.js'}) %>

-   Better just to have `glob` do it
-   Documentation says there's an `options` argument

<%- include('/_inc/code.html', {file: 'glob-filter-with-options.js'}) %>

-   Now specify a source directory and fold that into the glob

<%- include('/_inc/code.html', {file: 'glob-with-source-directory.js'}) %>

-   This uses <g key="string_interpolation">string interpolation</g>
    -   Back-quote the string
    -   Use `${name}` to insert the value of an expression
    -   This is completely separate from the globbing

-   Now we know that the paths will start with
-   So we can take a second argument that specifies an output directory

<%- include('/_inc/code.html', {file: 'glob-with-dest-directory.js'}) %>

-   This uses <g key="destructuring_assignment">destructuring assignment</g>
    -   And only works if both source and destination are given on the command line

-   Now ensure that the output directory exists

<%- include('/_inc/code.html', {file: 'glob-ensure-output-directory.js'}) %>

-   Use [`fs-extra`][node-fs-extra] instead of `fs` because it provides some useful utilities
-   And use [`path`][node-path] to manipulate pathnames because someone else has figured out the string manipulation
-   Gives us an empty tree of directories
-   Note the name changes
    -   Use `srcRoot` and `destRoot` because we're going to need `destDir`
    -   Yes, this was a bug...

-   And now we copy the files

<%- include('/_inc/code.html', {file: 'copy-file-unfiltered.js'}) %>

-   And it *almost* works

<%- include('/_inc/multi.html', {pat: 'copy-file-unfiltered.*', fill: 'sh text'}) %>

-   Because `fs.realpath` is a directory, not a file, but matches our `glob`

<%- include('/_inc/code.html', {file: 'copy-file-filtered.js'}) %>

-   This works...
-   ...but four levels of asynchronous callbacks is hard to follow
-   We need a better mechanism

## How can promises make this cleaner? {#promises}

-   Most functions execute in order

<%- include('/_inc/multi.html', {pat: 'not-callbacks-alone.*', fill: 'js text'}) %>

-   A handful of built-in functions delay execution
    -   `setTimeout`'s name suggests what it does

<%- include('/_inc/multi.html', {pat: 'callbacks-with-timeouts.*', fill: 'js text'}) %>

-   Setting a timeout of zero has the effect of deferring execution without delay
    -   I.e., give something else a chance to run

<%- include('/_inc/multi.html', {pat: 'callbacks-with-zero-timeouts.*', fill: 'js text'}) %>

-   We can use this to build a generic <g key="non_blocking_execution">non-blocking</g> function

<%- include('/_inc/multi.html', {pat: 'non-blocking.*', fill: 'js text'}) %>

-   Why bother?
    -   Because we may want to give something else a chance to run
-   Node provides `setImmediate` to do this for us
    -   And also `process.nextTick`, which doesn't do quite the same thing

<%- include('/_inc/multi.html', {pat: 'set-immediate.*', fill: 'js text'}) %>

-   Let's build something better
    -   Based on [Trey Huffine's tutorial][huffine-promises]
-   Create a class called `Pledge`
    -   Because the real thing is called `Promise`
-   Its constructor requires a single function called `action`
-   This function must take take two callbacks as arguments:
    -   What to do if the action completes successfully
    -   What to do if it doesn't
-   `Pledge` will provide both of these callbacks to the action at the right time
-   Give it two methods:
    -   `then` to enable more actions
    -   `catch` to handle errors
-   We arbitrarily decide that we can have as many `then`s as we want, but only one `catch`
-   If the action completes successfully, it gives us a value
-   We pass this value to the first `then`, pass the result of that `then` to the second one, etc.
-   If any of them fail, we pass the exception object to the error handler

<%- include('/_inc/code.html', {file: 'pledge.js'}) %>

-   There's one unfortunate trick: `bind`.
    -   When we create an object `obj` and call a method `meth`, JavaScript sets `this` inside `meth`
    -   If we use a method as a callback, `this` isn't set
    -   To convert the method to a plain old function with the right `this`, we use `bind`
    -   See [the documentation][bind-docs] for details

-   Create a pledge and return a value

<%- include('/_inc/multi.html', {pat: 'use-pledge-1.*', fill: 'js text'}) %>

-   Right: we don't use `return` with pledges, we call `resolve` or `reject`
    -   And we haven't done anything that defers execution
-   Try that again with:
    -   `setTimeout` to defer execution
    -   A call to `resolve` to trigger whatever comes next

<%- include('/_inc/multi.html', {pat: 'use-pledge-2.*', fill: 'js text'}) %>

-   A more complex example showing how to chain things
    -   And how exceptions are caught

<%- include('/_inc/multi.html', {pat: 'use-pledge-3.*', fill: 'js text'}) %>

-   And finally an example where we explicitly signal a problem by calling `reject`

<%- include('/_inc/multi.html', {pat: 'use-pledge-4.*', fill: 'js text'}) %>

-   Use this to build a line-counting program
-   Use the <g key="promisification">promisified</g> version of `fs-extra`

<%- include('/_inc/multi.html', {pat: 'count-lines-single-file.*', fill: 'js sh text'}) %>

-   And there's `glob-promise` as well

<%- include('/_inc/multi.html', {pat: 'count-lines-globbed-files.*', fill: 'js sh text'}) %>

-   Want filenames
-   So construct temporary objects that have the information we need downstream
    -   Use object with named fields instead of array with positional values

<%- include('/_inc/code.html', {file: 'count-lines-print-filenames.js'}) %>

-   Works until we run into a directory whose name name matches `*.*`
    -   Which we do in `node_modules`
-   Need to use a `stat` call to check if something is a file or not
    -   But `stat` returns a stats object that doesn't include the file's name
    -   So we create a pair to pass down the chain
    -   Use `{filename, stats}` to give the objects keys and values that match up

<%- include('/_inc/multi.html', {pat: 'count-lines-with-stat.*', fill: 'js sh text'}) %>

-   Now make a histogram of how many files are of each length
    -   Only look at `.js` files with the `glob`

<%- include('/_inc/multi.html', {pat: 'count-lines-histogram.*', fill: 'js sh text'}) %>
