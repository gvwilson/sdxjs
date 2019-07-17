---
---

-   Goal: show how promises work and how they are implemented

## How can I copy a file tree? {#copy-file-tree}

-   List the contents of a directory (the wrong way).

{% include file.md file="list-dir-wrong.js" %}

-   Use `require(library-name)` to load a library
    -   Returns an object
    -   Assign that to a constant
        -   Allows us to give short nicknames to meaningfully-named libraries
    -   Use `library.component` to refer to things in the library

{% include wildcard.md pattern="list-dir-wrong.*" values="sh,text" %}

-   Use the [`fs`][node-fs] library
-   `fs.readdir` doesn't return anything
-   [Documentation][node-fs] says that it takes a [callback][callback]
-   JavaScript uses a [single-threaded][single-threaded] programming model
    -   Any operation that might delay, such as file I/O, is set aside to be run later
-   Rewrite with an explicit function

{% include file.md file="list-dir-function-defined.js" %}

-   Node callbacks always get an error (if any) as their first argument
    -   Use `console.error` to report it for now
    -   Do something more sensible once we understand exceptions
-   The actual results are passed as the other argument (in this case, `files`)

{% include wildcard.md pattern="list-dir-function-defined.*" values="sh,text"%}

-   More idiomatic to define the callback [anonymously][anonymous-function] where it's used

{% include file.md file="list-dir-function-anonymous.js" %}

-   So how do we get all the files to be copied?
-   Use [`glob`][node-glob]
    -   [Globbing][globbing] is an old Unix name (short for "global")
-   Start by getting all filenames
    -   Works by name, not by type
    -   So filenames that *don't* match `*.*` won't be detected

{% include wildcard.md pattern="glob-all-files.*" values="js,text"%}

-   Works, but we probably don't want to copy [Emacs][emacs] backup files (ending with `~`)
-   We can get the list and then [filter][filter] those out

{% include wildcard.md pattern="glob-get-then-filter-pedantic.*" values="js,text" %}

-   `Array.filter` creates a new array containing all the items of the original that pass the test
-   We can make this more idiomatic by:
    -   Removing the parentheses around the single parameter
    -   Writing a naked expression

{% include file.md file="glob-get-then-filter-idiomatic.js" %}

-   Better just to have `glob` do it
-   Documentation says there's an `options` argument

{% include file.md file="glob-filter-with-options.js" %}

-   Now specify a source directory and fold that into the glob

{% include file.md file="glob-with-source-directory.js" %}

-   This uses [string interpolation][string-interpolation]
    -   Back-quote the string
    -   Use `${name}` to insert the value of an expression
    -   This is completely separate from the globbing

-   Now we know that the paths will start with
-   So we can take a second argument that specifies an output directory

{% include file.md file="glob-with-dest-directory.js" %}

-   This uses [destructuring assignment][destructuring-assignment]
    -   And only works if both source and destination are given on the command line

-   Now ensure that the output directory exists

{% include file.md file="glob-ensure-output-directory.js" %}

-   Use [`fs-extra`][node-fs-extra] instead of `fs` because it provides some useful utilities
-   And use [`path`][node-path] to manipulate pathnames because someone else has figured out the string manipulation
-   Gives us an empty tree of directories
-   Note the name changes
    -   Use `srcRoot` and `destRoot` because we're going to need `destDir`
    -   Yes, this was a bug...

-   And now we copy the files

{% include file.md file="copy-file-unfiltered.js" %}

-   And it *almost* works

{% include wildcard.md pattern="copy-file-unfiltered.*" values="sh,text" %}

-   Because `fs.realpath` is a directory, not a file, but matches our `glob`

{% include file.md file="copy-file-filtered.js" %}

-   This works...
-   ...but four levels of asynchronous callbacks is hard to follow
-   We need a better mechanism

## How can promises make this cleaner? {#promises}

-   Most functions execute in order

{% include wildcard.md pattern="not-callbacks-alone.*" values="js,text" %}

-   A handful of built-in functions delay execution
    -   `setTimeout`'s name suggests what it does

{% include wildcard.md pattern="callbacks-with-timeouts.*" values="js,text" %}

-   Setting a timeout of zero has the effect of deferring execution without delay
    -   I.e., give something else a chance to run

{% include wildcard.md pattern="callbacks-with-zero-timeouts.*" values="js,text" %}

-   We can use this to build a generic [non-blocking][non-blocking-execution] function

{% include wildcard.md pattern="non-blocking.*" values="js,text" %}

-   Why bother?
    -   Because we may want to give something else a chance to run
-   Node provides `setImmediate` to do this for us
    -   And also `process.nextTick`, which doesn't do quite the same thing

{% include wildcard.md pattern="set-immediate.*" values="js,text" %}

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

{% include file.md file="pledge.js" %}

-   There's one unfortunate trick: `bind`.
    -   When we create an object `obj` and call a method `meth`, JavaScript sets `this` inside `meth`
    -   If we use a method as a callback, `this` isn't set
    -   To convert the method to a plain old function with the right `this`, we use `bind`
    -   See [the documentation][bind-docs] for details

-   Create a pledge and return a value

{% include wildcard.md pattern="use-pledge-1.*" values="js,text" %}

-   Right: we don't use `return` with pledges, we call `resolve` or `reject`
    -   And we haven't done anything that defers execution
-   Try that again with:
    -   `setTimeout` to defer execution
    -   A call to `resolve` to trigger whatever comes next

{% include wildcard.md pattern="use-pledge-2.*" values="js,text" %}

-   A more complex example showing how to chain things
    -   And how exceptions are caught

{% include wildcard.md pattern="use-pledge-3.*" values="js,text" %}

-   And finally an example where we explicitly signal a problem by calling `reject`

{% include wildcard.md pattern="use-pledge-4.*" values="js,text" %}

-   Use this to build a line-counting program
-   Use the [promisified][promisification] version of `fs-extra`

{% include wildcard.md pattern="count-lines-single-file.*" values="js,sh,text" %}

-   And there's `glob-promise` as well

{% include wildcard.md pattern="count-lines-globbed-files.*" values="js,sh,text" %}

-   Want filenames
-   So construct temporary objects that have the information we need downstream
    -   Use object with named fields instead of array with positional values

{% include file.md file="count-lines-print-filenames.js" %}

-   Works until we run into a directory whose name name matches `*.*`
    -   Which we do in `node_modules`
-   Need to use a `stat` call to check if something is a file or not
    -   But `stat` returns a stats object that doesn't include the file's name
    -   So we create a pair to pass down the chain
    -   Use `{filename, stats}` to give the objects keys and values that match up

{% include wildcard.md pattern="count-lines-with-stat.*" values="js,sh,text" %}

-   Now make a histogram of how many files are of each length
    -   Only look at `.js` files with the `glob`

{% include wildcard.md pattern="count-lines-histogram.*" values="js,sh,text" %}

{% include links.md %}
