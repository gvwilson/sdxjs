---
title: "Systems Programming"
---

The biggest difference between JavaScript and most other programming languages
is that many operations in JavaScript are [%i "asynchronous execution" "execution!asynchronous" %][%g asynchronous "asynchronous" %][%/i%].
Its designers didn't want browsers to freeze while waiting for data to arrive or for users to click on things,
so operations that might be slow are implemented by describing now what to do later.
And since anything that touches the hard drive is slow from a processor's point of view,
[Node][nodejs] implements [%i "filesystem operations" %][%g filesystem "filesystem" %][%/i%] operations the same way.

<div class="callout" markdown="1">

### How slow is slow?

[%b Gregg2020 %] used the analogy in [%t systems-programming-times %]
to show how long it takes a computer to do different things
if we imagine that one CPU cycle is equivalent to one second.

</div>

<div class="table" id="systems-programming-times" caption="Computer operation times at human scale." markdown="1">
| Operation | Actual Time | Would Be… |
| --------- | ----------- | --------- |
| 1 CPU cycle | 0.3 nsec | 1 sec |
| Main memory access | 120 nsec | 6 min |
| Solid-state disk I/O | 50-150 μsec | 2-6 days |
| Rotational disk I/O | 1-10 msec | 1-12 months |
| Internet: San Francisco to New York | 40 msec | 4 years |
| Internet: San Francisco to Australia | 183 msec | 19 years |
| Physical system reboot | 5 min | 32,000 years |
</div>

Early JavaScript programs used [%i "callback function" %][%g callback "callback functions" %][%/i%] to describe asynchronous operations,
but as we're about to see,
callbacks can be hard to understand even in small programs.
In 2015,
the language's developers standardized a higher-level tool called promises
to make callbacks easier to manage,
and more recently they have added new keywords called `async` and `await` to make it easier still.
We need to understand all three layers in order to debug things when they go wrong,
so this chapter explores callbacks,
while [%x async-programming %] shows how promises and `async`/`await` work.
This chapter also shows how to read and write files and directories with Node's standard libraries,
because we're going to be doing that a lot.

<div class="pagebreak"></div>

## How can we list a directory? {: #systems-programming-ls}

To start,
let's try listing the contents of a directory the way we would in [%i "Python" %][Python][python][%/i%]
or [%i "Java" %][Java][java][%/i%]:

[% inc file="list-dir-wrong.js" %]

We use [%i "import module" %]<code>import <em>module</em> from 'source'</code>[%/i%] to load the library <code><em>source</em></code>
and assign its contents to <code><em>module</em></code>.
After that,
we can refer to things in the library using <code><em>module.component</em></code>
just as we refer to things in any other object.
We can use whatever name we want for the module,
which allows us to give short nicknames to libraries with long names;
we will take advantage of this in future chapters.
{: .continue}

<div class="callout" markdown="1">

### `require` versus `import`

In 2015, a new version of JavaScript called ES6 introduced
the keyword [%i "import vs. require" "require vs. import" %]`import`[%/i%] for importing modules.
It improves on the older `require` function in several ways,
but Node still uses `require` by default.
To tell it to use `import`,
we have added `"type": "module"` at the top level of our Node `package.json` file.

</div>

Our little program uses the [`fs`][node_fs] library
which contains functions to create directories, read or delete files, etc.
(Its name is short for "filesystem".)
We tell the program what to list using [%i "command-line argument" %][%g command_line_argument "command-line arguments" %][%/i%],
which Node automatically stores in an array called [%i "process.argv" %]`process.argv`[%/i%].
The name of the program used to run our code is stored `process.argv[0]` (which in this case is `node`),
while `process.argv[1]` is the name of our program (in this case `list-dir-wrong.js`).
The rest of `process.argv` holds whatever arguments we gave at the command line when we ran the program,
so `process.argv[2]` is the first argument after the name of our program ([%f systems-programming-process-argv %]).

[% figure
   slug="systems-programming-process-argv"
   img="process-argv.svg"
   alt="Command-line arguments in `process.argv`"
   caption="How Node stores command-line arguments in <code>process.argv</code>."
%]

<div class="pagebreak"></div>

If we run this program with the name of a directory as its argument,
`fs.readdir` returns the names of the things in that directory as an array of strings.
The program uses `for (const name of results)` to loop over the contents of that array.
We could use `let` instead of `const`,
but it's good practice to declare things as [%i "const declaration!advantages of" %]`const`[%/i%] wherever possible
so that anyone reading the program knows the variable isn't actually going to vary---doing
this reduces the [%i "cognitive load" %][%g cognitive_load "cognitive load" %][%/i%] on people reading the program.
Finally,
[%i "console.log" %]`console.log`[%/i%] is JavaScript's equivalent of other languages' `print` command;
its strange name comes from the fact that
its original purpose was to create [%g log_message "log messages" %] in the browser [%g console "console" %].

Unfortunately,
our program doesn't work:

[% inc pat="list-dir-wrong.*" fill="sh out" %]

The error message comes from something we didn't write whose source we would struggle to read.
If we look for the name of our file (`list-dir-wrong.js`)
we see the error occurred on line 4;
everything above that is inside `fs.readdir`,
while everything below it is Node loading and running our program.
{: .continue}

The problem is that `fs.readdir` doesn't return anything.
Instead,
its documentation says that it needs a callback function
that tells it what to do when data is available,
so we need to explore those in order to make our program work.

<div class="callout" markdown="1">

### A theorem

1.  Every program contains at least one bug.
2.  Every program can be made one line shorter.
3.  Therefore, every program can be reduced to a single statement which is wrong.

— variously attributed
{: .continue}

</div>

## What is a callback function? {: #systems-programming-callback}

JavaScript uses a [%i "single-threaded execution" "execution!single-threaded" %][%g single_threaded "single-threaded" %][%/i%] programming model:
as the introduction to this lesson said,
it splits operations like file I/O into "please do this" and "do this when data is available".
`fs.readdir` is the first part,
but we need to write a function that specifies the second part.

<div class="pagebreak"></div>

JavaScript saves a reference to this function
and calls with a specific set of parameters when our data is ready
([%f systems-programming-callbacks %]).
Those parameters defined a standard [%i "protocol!API as" "API" %][%g protocol "protocol" %][%/i%]
for connecting to libraries,
just like the USB standard allows us to plug hardware devices together.

[% figure
   slug="systems-programming-callbacks"
   img="callbacks.svg"
   alt="Running callbacks"
   caption="How JavaScript runs callback functions."
%]

This corrected program gives `fs.readdir` a callback function called `listContents`:

[% inc file="list-dir-function-defined.js" %]

[%i "callback function!conventions for" %]Node callbacks[%/i%]
always get an error (if there is any) as their first argument
and the result of a successful function call as their second.
The function can tell the difference by checking to see if the error argument is `null`.
If it is, the function lists the directory's contents with `console.log`,
otherwise, it uses `console.error` to display the error message.
Let's run the program with the [%g current_working_directory "current working directory" %]
(written as '.')
as an argument:
{: .continue}

[% inc pat="list-dir-function-defined.*" fill="sh slice.out" %]

Nothing that follows will make sense if we don't understand
the order in which Node executes the statements in this program
([%f systems-programming-execution-order %]):

1.  Execute the first line to load the `fs` library.

1.  Define a function of two parameters and assign it to `listContents`.
    (Remember, a function is just another kind of data.)

1.  Get the name of the directory from the command-line arguments.

1.  Call `fs.readdir` to start a filesystem operation,
    telling it what directory we want to read and what function to call when data is available.

1.  Print a message to show we're at the end of the file.

1.  Wait until the filesystem operation finishes (this step is invisible).

1.  Run the callback function, which prints the directory listing.

[% figure
   slug="systems-programming-execution-order"
   img="execution-order.svg"
   alt="Callback execution order"
   caption="When JavaScript runs callback functions."
%]

## What are anonymous functions? {: #systems-programming-anonymous}

Most JavaScript programmers wouldn't define the function `listContents`
and then pass it as a callback.
Instead,
since the callback is only used in one place,
it is more [%g idiomatic "idiomatic" %]
to define it where it is needed
as an [%i "anonymous function" "function!anonymous" %][%g anonymous_function "anonymous function" %][%/i%].
This makes it easier to see what's going to happen when the operation completes,
though it means the order of execution is quite different from the order of reading
([%f systems-programming-anonymous-functions %]).
Using an anonymous function gives us the final version of our program:

[% inc file="list-dir-function-anonymous.js" %]

[% figure
   slug="systems-programming-anonymous-functions"
   img="anonymous-functions.svg"
   alt="Anonymous functions as callbacks"
   caption="How and when JavaScript creates and runs anonymous callback functions."
%]

<div class="callout" markdown="1">

### Functions are data

As we noted above,
a function is just [%i "code!as data" %]another kind of data[%/i%].
Instead of being made up of numbers, characters, or pixels, it is made up of instructions,
but these are stored in memory like anything else.
Defining a function on the fly is no different from defining an array in-place using `[1, 3, 5]`,
and passing a function as an argument to another function is no different from passing an array.
We are going to rely on this insight over and over again in the coming lessons.

</div>

## How can we select a set of files? {: #systems-programming-fileset}

Suppose we want to copy some files instead of listing a directory's contents.
Depending on the situation
we might want to copy only those files given on the command line
or all files except some explicitly excluded.
What we *don't* want to have to do is list the files one by one;
instead,
we want to be able to write patterns like `*.js`.

To find files that match patterns like that,
we can use the [`glob`][node_glob] module.
(To [%i "globbing" %][%g globbing "glob" %][%/i%] (short for "global") is an old Unix term for matching a set of files by name.)
The `glob` module provides a function that takes a pattern and a callback
and does something with every filename that matched the pattern:

[% inc pat="glob-all-files.*" fill="js slice.out" %]

The leading `**` means "recurse into subdirectories",
while `*.*` means "any characters followed by '.' followed by any characters"
([%f systems-programming-globbing %]).
Names that don't match `*.*` won't be included,
and by default,
neither are names that start with a '.' character.
This is another old Unix convention:
files and directories whose names have a leading '.'
usually contain configuration information for various programs,
so most commands will leave them alone unless told to do otherwise.

[% figure
   slug="systems-programming-globbing"
   img="globbing.svg"
   alt="Matching filenames with `glob`"
   caption="Using `glob` patterns to match filenames."
%]

This program works,
but we probably don't want to copy editor backup files whose names end with `.bck`.
We can get rid of them by [%i "globbing!filtering results" %][%g filter "filtering" %][%/i%] the list that `glob` returns:

<div class="pagebreak"></div>

[% inc pat="glob-get-then-filter-pedantic.*" fill="js slice.out" %]

[%i "Array.filter" %]`Array.filter`[%/i%] creates a new array
containing all the items of the original array that pass a test
([%f systems-programming-array-filter %]).
The test is specified as a callback function
that `Array.filter` calls once once for each item.
This function must return a [%g boolean "Boolean" %]
that tells `Array.filter` whether to keep the item in the new array or not.
`Array.filter` does not modify the original array,
so we can filter our original list of filenames several times if we want to.

[% figure
   slug="systems-programming-array-filter"
   img="array-filter.svg"
   alt="Using `Array.filter`"
   caption="Selecting array elements using `Array.filter`."
%]

We can make our globbing program more idiomatic by
removing the parentheses around the single parameter
and writing just the expression we want the function to return:

[% inc file="glob-get-then-filter-idiomatic.js" %]

However,
it turns out that `glob` will filter for us.
According to its documentation,
the function takes an `options` object full of key-value settings
that control its behavior.
This is another common pattern in Node libraries:
rather than accepting a large number of rarely-used parameters,
a function can take a single object full of settings.

If we use this,
our program becomes:

[% inc file="glob-filter-with-options.js" %]

Notice that we don't quote the key in the `options` object.
The keys in objects are almost always strings,
and if a string is simple enough that it won't confuse the parser,
we don't need to put quotes around it.
Here,
"simple enough" means "looks like it could be a variable name",
or equivalently "contains only letters, digits, and the underscore".
{: .continue}

<div class="callout" markdown="1">

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

</div>

To finish off our globbing program,
let's specify a source directory on the command line and include that in the pattern:

[% inc file="glob-with-source-directory.js" %]

This program uses [%i "string interpolation" %][%g string_interpolation "string interpolation" %][%/i%]
to insert the value of `srcDir` into a string.
The template string is written in back quotes,
and JavaScript converts every expression written as `${expression}` to text.
We could create the pattern by concatenating strings using
`srcDir + '/**/*.*'`,
but most programmers find interpolation easier to read.
{: .continue}

## How can we copy a set of files? {: #systems-programming-copy}

If we want to copy a set of files instead of just listing them
we need a way to create the [%g path "paths" %] of the files we are going to create.
If our program takes a second argument that specifies the desired output directory,
we can construct the full output path by replacing the name of the source directory with that path:

[% inc file="glob-with-dest-directory.js" %]

This program uses [%i "destructuring assignment" "assignment!destructuring" %][%g destructuring_assignment "destructuring assignment" %][%/i%]
to create two variables at once
by unpacking the elements of an array
([%f systems-programming-destructuring-assignment %]).
It only works if the array contains enough elements,
i.e.,
if both a source and destination are given on the command line;
we'll add a check for that in the exercises.
{: .continue}

[% figure
   slug="systems-programming-destructuring-assignment"
   img="destructuring-assignment.svg"
   alt="Matching values with destructuring assignment"
   caption="Assigning many values at once by destructuring."
%]

A more serious problem is that
this program only works if the destination directory already exists:
`fs` and equivalent libraries in other languages usually won't create directories for us automatically.
The need to do this comes up so often that there is a function called `ensureDir` to do it:

[% inc file="glob-ensure-output-directory.js" %]

Notice that we import from `fs-extra` instead of `fs`;
the [`fs-extra`][node_fs_extra] module provides some useful utilities on top of `fs`.
We also use [`path`][node_path] to manipulate pathnames
rather than concatenating or interpolating strings
because there are a lot of tricky [%g edge_case "edge cases" %] in pathnames
that the authors of that module have figured out for us.

<div class="callout" markdown="1">

### Using distinct names

We are now calling our command-line arguments `srcRoot` and `dstRoot`
rather than `srcDir` and `dstDir`.
We originally used `dstDir` as both
the name of the top-level destination directory (from the command line)
and the name of the particular output directory to create.
This was legal,
since every function creates
a new [%i "scope!of variable definitions" "variable definition!scope" %][%g scope "scope" %][%/i%],
but hard for people to understand.

</div>

Our file copying program currently creates empty destination directories
but doesn't actually copy any files.
Let's use `fs.copy` to do that:

[% inc file="copy-file-unfiltered.js" %]

The program now has three levels of callback
([%f systems-programming-triple-callback %]):

1.  When `glob` has data, do things and then call `ensureDir`.

1.  When `ensureDir` completes, copy a file.

1.  When `copy` finishes, check the error status.

[% figure
   slug="systems-programming-triple-callback"
   img="triple-callback.svg"
   alt="Three levels of callback"
   caption="Three levels of callback in the running example."
%]

Our program looks like it should work,
but if we try to copy everything in the directory containing these lessons
we get an error message:

[% inc pat="copy-file-unfiltered.*" fill="sh out" %]

The problem is that `node_modules/fs.stat` and `node_modules/fs.walk` match our globbing expression,
but are directories rather than files.
To prevent our program from trying to use `fs.copy` on directories,
we must use `fs.stat` to get the properties of the things `glob` gives us
and then check if they are files.
The name "stat" is short for "status",
and since the status of something in the filesystem can be very complex,
[%i "fs.stat" %]`fs.stat`[%/i%] returns [an object with methods that can answer common questions][node_fs_stats].

Here's the final version of our file copying program:

[% inc file="copy-file-filtered.js" %]

It works,
but four levels of asynchronous callbacks is hard for humans to understand.
[%x async-programming %] will introduce a pair of tools
that make code like this easier to read.
{: .continue}

## Exercises {: #systems-programming-exercises}

### Where is Node? {: .exercise}

Write a program called `wherenode.js` that prints the full path to the version of Node it is run with.

### Tracing callbacks {: .exercise}

In what order does the program below print messages?

[% inc file="x-trace-callback/trace.js" %]

### Tracing anonymous callbacks {: .exercise}

In what order does the program below print messages?

[% inc file="x-trace-anonymous/trace.js" %]

### Checking arguments {: .exercise}

Modify the file copying program to check that it has been given the right number of command-line arguments
and to print a sensible error message (including a usage statement) if it hasn't.

### Glob patterns {: .exercise}

What filenames does each of the following glob patterns match?

-   `results-[0123456789].csv`
-   `results.(tsv|csv)`
-   `results.dat?`
-   `./results.data`

### Filtering arrays {: .exercise}

Fill in the blank in the code below so that the output matches the one shown.
Note: you can compare strings in JavaScript using `<`, `>=`, and other operators,
so that (for example) `person.personal > 'P'` is `true`
if someone's personal name starts with a letter that comes after 'P' in the alphabet.

[% inc pat="x-array-filter/filter.*" fill="js txt" %]

### String interpolation {: .exercise}

Fill in the code below so that it prints the message shown.

[% inc pat="x-string-interpolation/interpolate.*" fill="js txt" %]

### Destructuring assignment {: .exercise}

What is assigned to each named variable in each statement below?

1.  `const first = [10, 20, 30]`
1.  `const [first, second] = [10, 20, 30]`
1.  `const [first, second, third] = [10, 20, 30]`
1.  `const [first, second, third, fourth] = [10, 20, 30]`
1.  `const {left, right} = {left: 10, right: 30}`
1.  `const {left, middle, right} = {left: 10, middle: 20, right: 30}`

### Counting lines {: .exercise}

Write a program called `lc` that counts and reports the number of lines in one or more files and the total number of lines,
so that `lc a.txt b.txt` displays something like:

```txt
a.txt 475
b.txt 31
total 506
```

### Renaming files {: .exercise}

Write a program called `rename` that takes three or more command-line arguments:

1.  A [%g filename_extension "filename extension" %] to match.
2.  An extension to replace it with.
3.  The names of one or more existing files.

When it runs,
`rename` renames any files with the first extension to create files with the second extension,
but will *not* overwrite an existing file.
For example,
suppose a directory contains `a.txt`, `b.txt`, and `b.bck`.
The command:

```sh
rename .txt .bck a.txt b.txt
```

will rename `a.txt` to `a.bck`,
but will *not* rename `b.txt` because `b.bck` already exists.
{: .continue}
