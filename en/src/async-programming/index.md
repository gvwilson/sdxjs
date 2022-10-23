---
title: "Asynchronous Programming"
---

Callbacks work,
but they are hard to read and debug,
which means they only "work" in a limited sense.
JavaScript's developers added [%i "promise!as alternative to callback" %][%g promise "promises" %][%/i%] to the language in 2015
to make callbacks easier to write and understand,
and more recently they added the keywords `async` and `await` as well
to make asynchronous programming easier still.
To show how these work,
we will create a [%g class "class" %] of our own called `Pledge`
that provides the same core features as promises.
Our explanation was inspired by [%i "Huffine, Trey" %][Trey Huffine's][huffine_trey][%/i%] [tutorial][huffine_promises],
and we encourage you to read that as well.

## How can we manage asynchronous execution? {: #async-programming-manage}

JavaScript is built around an [%i "event loop" "execution!event loop" %][%g event_loop "event loop" %][%/i%].
Every task is represented by an entry in a queue;
the event loop repeatedly takes a task from the front of the queue,
runs it,
and adds any new tasks that it creates to the back of the queue to run later.
Only one task runs at a time;
each has its own [%g call_stack "call stack" %],
but objects can be shared between tasks
([%f async-programming-event-loop %]).

[% figure
   slug="async-programming-event-loop"
   img="event-loop.svg"
   alt="The event loop"
   caption="Using an event loop to manage concurrent tasks."
%]

Most tasks execute all the code available in the order it is written.
For example,
this one-line program uses [%i "Array.forEach" %]`Array.forEach`[%/i%]
to print each element of an array in turn:

[% inc pat="not-callbacks-alone.*" fill="js out" %]

However,
a handful of special built-in functions make [Node][nodejs] switch tasks
or add new tasks to the run queue.
For example,
[%i "setTimeout" %]`setTimeout`[%/i%] tells Node to run a callback function
after a certain number of milliseconds have passed.
Its first argument is a callback function that takes no arguments,
and its second is the delay.
When `setTimeout` is called,
Node sets the callback aside for the requested length of time,
then adds it to the run queue.
(This means the task runs *at least* the specified number of milliseconds later.)

<div class="callout" markdown="1">

### Why zero arguments?

`setTimeout`'s requirement that callback functions take no arguments
is another example of a [%i "protocol!API as" "API" %][%g protocol "protocol" %][%/i%].
One way to think about it is that protocols allow old code to use new code:
whoever wrote `setTimeout` couldn't know what specific tasks we want to delay,
so they specified a way to wrap up any task at all.

</div>

As the listing below shows,
the original task can generate many new tasks before it completes,
and those tasks can run in a different order than the order in which they were created
([%f async-programming-set-timeout %]).

[% inc pat="callbacks-with-timeouts.*" fill="js out" %]

[% figure
   slug="async-programming-set-timeout"
   img="set-timeout.svg"
   alt="Setting a timeout"
   caption="Using `setTimeout` to delay operations."
%]

If we give `setTimeout` a delay of zero milliseconds,
the new task can be run right away,
but any other tasks that are waiting have a chance to run as well:

[% inc pat="callbacks-with-zero-timeouts.*" fill="js out" %]

We can use this trick to build a generic
[%i "execution!non-blocking" "non-blocking execution" %][%g non_blocking_execution "non-blocking function" %][%/i%]
that takes a callback defining a task
and switches tasks if any others are available:
{: .continue}

[% inc pat="non-blocking.*" fill="js out" %]

Node's built-in function [%i "setImmediate" %]`setImmediate`[%/i%]
does exactly what our `nonBlocking` function does:
Node also has `process.nextTick`,
which doesn't do quite the same thing---we'll explore the differences in the exercises.

[% inc pat="set-immediate.*" fill="js out" %]

## How do promises work? {: #async-programming-promises}

Before we start building our own [%i "promise!behavior" %]promises[%/i%],
let's look at how we want them to work:

[% inc pat="use-pledge-motivation.*" fill="js out" %]

This short program creates a new `Pledge`
with a callback that takes two other callbacks as arguments:
[%i "promise!resolve" "resolve promise" %]`resolve`[%/i%] (which will run when everything worked)
and [%i "promise!reject" "reject promise" %]`reject`[%/i%] (which will run when something went wrong).
The top-level callback does the first part of what we want to do,
i.e.,
whatever we want to run before we expect a delay;
for demonstration purposes, we will use `setTimeout` with zero delay to switch tasks.
Once this task resumes,
we call the `resolve` callback to trigger whatever is supposed to happen after the delay.

Now look at the line with `then`.
This is a [%g method "method" %] of the `Pledge` object we just created,
and its job is to do whatever we want to do after the delay.
The argument to `then` is yet another callback function;
it will get the value passed to `resolve`,
which is how the first part of the action communicates with the second
([%f async-programming-resolve %]).

[% figure
   slug="async-programming-resolve"
   img="resolve.svg"
   alt="How promises resolve"
   caption="Order of operations when a promise resolves."
%]

In order to make this work,
`Pledge`'s [%g constructor "constructor" %] must take a single function called `action`.
This function must take two callbacks as arguments:
what to do if the action completes successfully
and what to do if it doesn't (i.e., how to handle errors).
`Pledge` will provide these callbacks to the action at the right times.

<div class="pagebreak"></div>

`Pledge` also needs two methods:
[%i "promise!then" %]`then`[%/i%] to enable more actions
and [%i "promise!catch" %]`catch`[%/i%] to handle errors.
To simplify things just a little bit,
we will allow users to [%i "method chaining" %][%g method_chaining "chain" %][%/i%] as many `then`s as they want,
but only allow one `catch`.

## How can we chain operations together? {: #async-programming-fluent}

A [%i "fluent interface" "programming style!fluent interface" %][%g fluent_interface "fluent interface" %][%/i%]
is a style of object-oriented programming
in which the methods of an object return `this`
so that method calls can be chained together.
For example,
if our class is:

```js
class Fluent {
  constructor () {...}

  first (top) {
    ...do something with top...
    return this
  }

  second (left, right) {
    ...do something with left and right...
  }
}
```

then we can write:
{: .continue}

```js
  const f = new Fluent()
  f.first('hello').second('and', 'goodbye')
```

or even
{: .continue}

```js
  (new Fluent()).first('hello').second('and', 'goodbye')
```

`Array`'s fluent interface lets us write expressions like
`Array.filter(...).map(...)`
that are usually more readable than assigning intermediate results to temporary variables.

If the original action given to our `Pledge` completes successfully,
the `Pledge` gives us a value by calling the `resolve` callback.
We pass this value to the first `then`,
pass the result of that `then` to the second one,
and so on.
If any of them fail and throw an [%i "exception!in promise" %][%g exception "exception" %][%/i%],
we pass that exception to the error handler.
Putting it all together,
the whole class looks like this:

[% inc file="pledge.js" %]

<div class="callout" markdown="1">

### Binding `this`

`Pledge`'s constructor makes two calls to a special function called [%i "bind method to object" %]`bind`[%/i%].
When we create an object `obj` and call a method `meth`,
JavaScript sets the special variable `this` to `obj` inside `meth`.
If we use a method as a callback,
though,
`this` isn't automatically set to the correct object.
To convert the method to a plain old function with the right `this`,
we have to use `bind`.
[The documentation][bind_docs] has more details and examples.

</div>

Let's create a `Pledge` and return a value:

[% inc pat="use-pledge-return.*" fill="js out" %]

Why didn't this work?
{: .continue}

1.  We can't use `return` with pledges
    because the call stack of the task that created the pledge is gone
    by the time the pledge executes.
    Instead, we must call `resolve` or `reject`.

2.  We haven't done anything that defers execution,
    i.e.,
    there is no call to `setTimeout`, `setImmediate`,
    or anything else that would switch tasks.
    Our original motivating example got this right.

This example shows how we can chain actions together:

[% inc pat="use-pledge-chained.*" fill="js out" %]

Notice that inside each `then` we *do* use `return`
because these clauses all run in a single task.
As we will see in the next section,
the full implementation of `Promise` allows us to run both normal code
and delayed tasks inside `then` handlers.
{: .continue}

Finally,
in this example we explicitly signal a problem by calling `reject`
to make sure our error handling does what it's supposed to:

[% inc pat="use-pledge-reject.*" fill="js out" %]

## How are real promises different? {: #async-programming-real}

Let's rewrite our chained pledge with built-in promises:

[% inc pat="use-promise-chained.*" fill="js out" %]

It looks almost the same,
but if we read the output carefully
we can see that the callbacks run *after* the main program finishes.
This is a signal that Node is delaying the execution of the code in the `then` handler.

A very common pattern is to return another promise from inside `then`
so that the next `then` is called on the returned promise,
not on the original promise
([%f async-programming-chained %]).
This is another way to implement a fluent interface:
if a method of one object returns a second object,
we can call a method of the second object immediately.

[% inc pat="promise-example.*" fill="js out" %]

[% figure
   slug="async-programming-chained"
   img="chained.svg"
   alt="Chained promises"
   caption="Chaining promises to make asynchronous operations depend on each other."
%]

We therefore have three rules for chaining promises:

1.  If our code can run synchronously, just put it in `then`.

1.  If we want to use our own asynchronous function,
    it must create and return a promise.

1.  Finally,
    if we want to use a library function that relies on callbacks,
    we have to convert it to use promises.
    Doing this is called [%g promisification "promisification" %]
    (because programmers will rarely pass up an opportunity to add a bit of jargon to the world),
    and most functions in Node have already been promisified.

## How can we build tools with promises? {: #async-programming-tools}

Promises may seem more complex than callbacks right now,
but that's because we're looking at how they work rather than at how to use them.
To explore the latter subject,
let's use promises to build a program to count the number of lines in a set of files.
A few moments of search on [NPM][npm] turns up a promisified version of `fs-extra`
called `fs-extra-promise`,
so we will rely on it for file operations.

Our first step is to count the lines in a single file:

[% inc pat="count-lines-single-file.*" fill="js sh out" %]

<div class="callout" markdown="1">

### Character encoding

A [%i "character encoding" %][%g character_encoding "character encoding" %][%/i%]
specifies how characters are stored as bytes.
The most widely used is [%i "UTF-8" "character encoding!UTF-8" %][%g utf_8 "UTF-8" %][%/i%],
which stores characters common in Western European languages in a single byte
and uses multi-byte sequences for other symbols.
If we don't specify a character encoding,
`fs.readFileAsync` gives us an array of bytes rather than a string of characters.
We can tell we've made this mistake when we try to call a method of `String`
and Node tells us we can't.

</div>

The next step is to count the lines in multiple files.
We can use `glob-promise` to delay handling the output of `glob`,
but we need some way to create a separate task to count the lines in each file
and to wait until those line counts are available before exiting our program.

The tool we want is [%i "Promise.all" %]`Promise.all`[%/i%],
which waits until all of the promises in an array have completed.
To make our program a little more readable,
we will put the creation of the promise for each file in a separate function:

[% inc pat="count-lines-globbed-files.*" fill="js sh slice.out" %]

However,
we want to display the names of the files whose lines we're counting along with the counts.
To do this our `then` must return two values.
We could put them in an array,
but it's better practice to construct a temporary object with named fields
([%f async-programming-temporary-named-fields %]).
This approach allows us to add or rearrange fields without breaking code
and also serves as a bit of documentation.
With this change
our line-counting program becomes:

[% inc file="count-lines-print-filenames.js" %]

[% figure
   slug="async-programming-temporary-named-fields"
   img="temporary-named-fields.svg"
   alt="Temporary objects with named fields"
   caption="Creating temporary objects with named fields to carry values forward."
%]

As in [%x systems-programming %],
this works until we run into a directory whose name name matches `*.*`,
which we do when counting the lines in the contents of `node_modules`.
The solution once again is to use `stat` to check if something is a file or not
before trying to read it.
And since `stat` returns an object that doesn't include the file's name,
we create another temporary object to pass information down the chain of `then`s.

[% inc pat="count-lines-with-stat.*" fill="js sh slice.out" %]

This code is complex, but much simpler than it would be if we were using callbacks.
{: .continue}

<div class="callout" markdown="1">

### Lining things up

This code uses the expression `{filename, stats}`
to create an object whose keys are `filename` and `stats`,
and whose values are the values of the corresponding variables.
Doing this makes the code easier to read,
both because it's shorter
but also because it signals that the value associated with the key `filename`
is exactly the value of the variable with the same name.

</div>

## How can we make this more readable? {: #async-programming-readable}

Promises eliminate the deep nesting associated with callbacks of callbacks,
but they are still hard to follow.
The latest versions of JavaScript provide two new keywords [%i "async keyword" %]`async`[%/i%] and [%i "await keyword" %]`await`[%/i%]
to flatten code further.
`async` means "this function implicitly returns a promise",
while `await` means "wait for a promise to resolve".
This short program uses both keywords to print the first ten characters of a file:

[% inc pat="await-fs.*" fill="js out" %]

<blockquote markdown="1">
### Translating code

When Node sees `await` and `async`
it silently [%i "promise!automatic creation of" %]converts[%/i%] the code to use promises with `then`, `resolve`, and `reject`;
we will see how this works in [%x code-generator %].
In order to provide a context for this transformation
we must put `await` inside a function that is declared to be `async`:
we can't simply write `await fs.statAsync(...)` at the top level of our program
outside a function.
This requirement is occasionally annoying,
but since we should be putting our code in functions anyway
it's hard to complain.
</blockquote>

To see how much cleaner our code is with `await` and `async`,
let's rewrite our line counting program to use them.
First,
we modify the two helper functions to look like they're waiting for results and returning them.
They actually wrap their results in promises and return those,
but Node now takes care of that for us:

[% inc file="count-lines-with-stat-async.js" keep="recycle" %]

Next,
we modify `main` to wait for things to complete.
We must still use `Promise.all` to handle the promises
that are counting lines for individual files,
but the result is less cluttered than our previous version.

[% inc file="count-lines-with-stat-async.js" keep="main" %]

## How can we handle errors with asynchronous code? {: #async-programming-errors}

We created several intermediate variables in the line-counting program to make the steps clearer.
Doing this also helps with error handling;
to see how,
we will build up an example in stages.

First,
if we return a promise that fails without using `await`,
then our main function will finish running before the error occurs,
and our `try`/`catch` doesn't help us
([%f async-programming-handling-errors %]):

[% inc pat="return-immediately.*" fill="js out" %]

[% figure
   slug="async-programming-handling-errors"
   img="handling-errors.svg"
   alt="Handling asynchronous errors"
   caption="Wrong and right ways to handle errors in asynchronous code."
%]

One solution to this problem is to be consistent and always return something.
Because the function is declared `async`,
the `Error` in the code below is automatically wrapped in a promise
so we can use `.then` and `.catch` to handle it as before:

[% inc pat="assign-immediately.*" fill="js out" %]

If instead we [%i "exception!with await" %]`return await`[%/i%],
the function waits until the promise runs before returning.
The promise is turned into an exception because it failed,
and since we're inside the scope of our `try`/`catch` block,
everything works as we want:

[% inc pat="return-await.*" fill="js out" %]

We prefer the second approach,
but whichever you choose,
please be consistent.
{: .continue}

## Exercises {: #async-programming-exercises}

### Immediate versus next tick {: .exercise}

What is the difference between `setImmediate` and `process.nextTick`?
When would you use each one?

### Tracing promise execution {: .exercise}

1.  What does this code print and why?

    ```js
    Promise.resolve('hello')
    ```

2.  What does this code print and why?

    ```js
    Promise.resolve('hello').then(result => console.log(result))
    ```

3.  What does this code print and why?

    ```js
    const p = new Promise((resolve, reject) => resolve('hello'))
      .then(result => console.log(result))
    ```

Hint: try each snippet of code interactively in the Node interpreter and as a command-line script.

### Multiple catches {: .exercise}

Suppose we create a promise that deliberately fails and then add two error handlers:

[% inc file="x-multiple-catch/example.js" %]

When the code is run it produces:
{: .continue}

[% inc file="x-multiple-catch/example.txt" %]

1.  Trace the order of operations: what is created and when is it executed?
2.  What happens if we run these same lines interactively?
    Why do we see something different than what we see when we run this file from the command line?

### Then after catch {: .exercise}

Suppose we create a promise that deliberately fails
and attach both `then` and `catch` to it:

[% inc file="x-catch-then/example.js" %]

When the code is run it produces:
{: .continue}

[% inc file="x-catch-then/example.txt" %]

1.  Trace the order of execution.
2.  Why is `undefined` printed at the end?

### Head and tail {: .exercise}

The Unix `head` command shows the first few lines of one or more files,
while the `tail` command shows the last few.
Write programs `head.js` and `tail.js` that do the same things using promises and `async`/`await`,
so that:

```sh
node head.js 5 first.txt second.txt third.txt
```

prints the first five lines of each of the three files and:
{: .continue}

```sh
node tail.js 5 first.txt second.txt third.txt
```

prints the last five lines of each file.
{: .continue}

### Histogram of line counts {: .exercise}

Extend `count-lines-with-stat-async.js` to create a program `lh.js`
that prints two columns of output:
the number of lines in one or more files
and the number of files that are that long.
For example,
if we run:

```sh
node lh.js promises/*.*
```

the output might be:
{: .continue}

| Length | Number of Files |
| ------ | --------------- |
|      1 |               7 |
|      3 |               3 |
|      4 |               3 |
|      6 |               7 |
|      8 |               2 |
|     12 |               2 |
|     13 |               1 |
|     15 |               1 |
|     17 |               2 |
|     20 |               1 |
|     24 |               1 |
|     35 |               2 |
|     37 |               3 |
|     38 |               1 |
|    171 |               1 |

### Select matching lines {: .exercise}

Using `async` and `await`,
write a program called `match.js` that finds and prints lines containing a given string.
For example:

```sh
node match.js Toronto first.txt second.txt third.txt
```

would print all of the lines from the three files that contain the word "Toronto".
{: .continue}

### Find lines in all files {: .exercise}

Using `async` and `await`,
write a program called `in-all.js` that finds and prints lines found in all of its input files.
For example:

```sh
node in-all.js first.txt second.txt third.txt
```

will print those lines that occur in all three files.
{: .continue}

### Find differences between two files {: .exercise}

Using `async` and `await`,
write a program called `file-diff.js`
that compares the lines in two files
and shows which ones are only in the first file,
which are only in the second,
and which are in both.
For example,
if `left.txt` contains:

```txt
some
people
```

and `right.txt` contains:
{: .continue}

```txt
write
some
code
```

then:
{: .continue}

```sh
node file-diff.js left.txt right.txt
```

would print:
{: .continue}

```txt
2 code
1 people
* some
2 write
```

where `1`, `2`, and `*` show whether lines are in only the first or second file
or are in both.
Note that the order of the lines in the file doesn't matter.
{: .continue}

Hint: you may want to use the `Set` class to store lines.

### Trace file loading {: .exercise}

Suppose we are loading a YAML configuration file
using the promisified version of the `fs` library.
In what order do the print statements in this test program appear and why?

[% inc file="x-trace-load/example.js" %]

### Any and all {: .exercise}

1.  Add a method `Pledge.any` that takes an array of pledges
    and as soon as one of the pledges in the array resolves,
    returns a single promise that resolves with the value from that pledge.

2.  Add another method `Pledge.all` that takes an array of pledges
    and returns a single promise that resolves to an array
    containing the final values of all of those pledges.

[This article][promise_all_any] may be helpful.
