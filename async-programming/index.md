---
---

Callbacks work,
but they are hard to read and debug,
which means they only "work" in a limited sense.
JavaScript's developers added promises to the language in 2015
to make callbacks easier to write and understand,
and more recently they added the keywords `async` and `await` as well
to make them easier still.
To show how these work,
we will create a <g key="class">class</g> of our own called `Pledge`
that provides the same core features as promises.
Our explanation was inspired by [Trey Huffine][huffine-trey]'s [tutorial][huffine-promises],
and we encourage you to read that as well.

## How can we manage asynchronous execution?

JavaScript is built around an <g key="event_loop">event loop</g>.
Every task is represented by an entry in a queue;
the event loop repeatedly takes a task from the front of the queue and runs it,
adding any new tasks that it creates to the back of the queue to run later.
Only one task runs at a time;
each task has its own <g key="call_stack">call stack</g>,
but objects can be shared between tasks
(<f key="async-programming-event-loop"></f>).

<%- include('/inc/figure.html', {
    id: 'async-programming-event-loop',
    img: '/static/tools-small.jpg',
    alt: 'The event loop',
    cap: 'Using an event loop to manage concurrent tasks.',
    fixme: true
}) %>

Most tasks execute all the code available in the order it is written.
For example,
this one-line program uses `Array.forEach`
to print each element of an array in turn:

<%- include('/inc/multi.html', {pat: 'not-callbacks-alone.*', fill: 'js out'}) %>

However,
a handful of special built-in functions make [Node][nodejs] switch tasks
or add new tasks to the run queue.
For example,
`setTimeout` tells [Node][nodejs] to run a callback function
after a certain number of milliseconds have passed.
Its first argument is a function of no arguments,
and its second is the delay.
When `setTimeout` is called,
[Node][nodejs] sets the callback aside for the requested time,
then adds it to the run queue
(which means that the task runs *at least* that many milliseconds later).
As the listing below shows,
this means that the original task can generate many new tasks before it completes,
and those tasks can then run in an arbitrary order
(<f key="async-programming-set-timeout"></f>).

<%- include('/inc/multi.html', {pat: 'callbacks-with-timeouts.*', fill: 'js out'}) %>

<%- include('/inc/figure.html', {
    id: 'async-programming-set-timeout',
    img: '/static/tools-small.jpg',
    alt: 'Setting a timeout',
    cap: 'Using <code>setTimeout</code> to delay operations.',
    fixme: true
}) %>

If we give `setTimeout` a delay of zero milliseconds,
the new task can be run right away,
but any other tasks that are waiting have a chance to run as well:

<%- include('/inc/multi.html', {pat: 'callbacks-with-zero-timeouts.*', fill: 'js out'}) %>

::: continue
We can use this trick to build a generic
<g key="non_blocking_execution">non-blocking function</g>
that takes a callback of zero arguments and switches tasks
if any other tasks are available
(<f key="async-programming-set-three-delays"></f>):

<%- include('/inc/multi.html', {pat: 'non-blocking.*', fill: 'js out'}) %>

<%- include('/inc/figure.html', {
    id: 'async-programming-set-three-delays',
    img: '/static/tools-small.jpg',
    alt: 'Delaying three function calls',
    cap: 'Order of operations with three delays function calls.',
    fixme: true
}) %>

[Node][nodejs]'s built-in function `setImmediate`
does exactly what our `nonBlocking` function does:
[Node][nodejs] also has `process.nextTick`,
which doesn't do quite the same thing---we'll explore the differences in the exercises.

<%- include('/inc/multi.html', {pat: 'set-immediate.*', fill: 'js out'}) %>

## How do promises work?

Before we start building our own promises,
let's look at how we want them to work:

<%- include('/inc/multi.html', {pat: 'use-pledge-motivation.*', fill: 'js out'}) %>

This short program creates a new `Pledge`
with a callback that takes two other callbacks as arguments:
`resolve` (which we run when everything worked)
and `reject` (which we run when something went wrong).
The top-level callback does the first part of what we want to do,
i.e.,
whatever we want to run before we expect a delay.
For demonstration purposes, we will use `setTimeout` with zero delay to switch tasks;
once this task resumes,
we call the `resolve` callback to trigger whatever is supposed to happen after the delay.

Now look at the line with `then`.
This is a <g key="method">method</g> of the `Pledge` object we just created,
and its job is to do whatever we want to do after the delay.
The argument to `then` is yet another callback function;
it will get the value passed to `resolve`,
which is how the first part of the action communicates with the second
(<f key="async-programming-resolve"></f>).

<%- include('/inc/figure.html', {
    id: 'async-programming-resolve',
    img: '/static/tools-small.jpg',
    alt: 'How promises resolve',
    cap: 'Order of operations when a promise resolves.',
    fixme: true
}) %>

In order to make this work,
`Pledge`'s <g key="constructor">constructor</g> must take a single function called `action`.
This function must take take two callbacks as arguments:
what to do if the action completes successfully
and what to do if it doesn't (i.e., how to handle errors).
`Pledge` will provide these callbacks to the action at the right times.

`Pledge` also needs two methods:
`then` to enable more actions
and `catch` to handle errors.
To simplify things just a little bit,
we will allow users to <g key="method_chaining">chain</a> as many `then`s as they want,
but only allow one `catch`.

If the original action completes successfully,
it gives us a value by calling the `resolve` callback.
We pass this value to the first `then`,
pass the result of that `then` to the second one,
and so on.
If any of them fail and throw an <g key="exception">exception</g>,
we pass that exception to the error handler.
Putting it all together,
the whole class looks like this:

<%- include('/inc/file.html', {file: 'pledge.js'}) %>

::: callout
### Binding `this`

`Pledge`'s constructor makes two calls to a special function called `bind`.
When we create an object `obj` and call a method `meth`,
JavaScript sets the special variable `this` to `obj` inside `meth`.
If we use a method as a callback,
though,
`this` isn't automatically set to the correct object.
To convert the method to a plain old function with the right `this`,
we have to use `bind`.
[The documentation][bind-docs] has more details and examples.
:::

Let's create a `Pledge` and return a value:

<%- include('/inc/multi.html', {pat: 'use-pledge-return.*', fill: 'js out'}) %>

::: continue
Why didn't this work?
:::

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

<%- include('/inc/multi.html', {pat: 'use-pledge-chained.*', fill: 'js out'}) %>

::: continue
Notice that inside each `then` we *do* use `return`
because these clauses all run in a single task.
As we will see in the next section,
the full implementation of `Promise` allows us to run both normal code
and delayed tasks inside `then` handlers.
:::

Finally,
in this example we explicitly signal a problem by calling `reject`
to make sure our error handling does what it's supposed to:

<%- include('/inc/multi.html', {pat: 'use-pledge-reject.*', fill: 'js out'}) %>

## How are real promises different?

Let's rewrite our chained pledge with built-in promises:

<%- include('/inc/multi.html', {pat: 'use-promise-chained.*', fill: 'js out'}) %>

It looks almost the same,
but if we read the output carefully
we can see that the callbacks run *after* the main program finishes.
This is a signal that [Node][nodejs] is delaying the execution of the code in the `then` handler.

A very common pattern is to return another promise from inside `then`
so that the next `then` is called on the returned promise,
not on the original promise
(<f key="async-programming-chained"></f>):

<%- include('/inc/multi.html', {pat: 'promise-example.*', fill: 'js out'}) %>

<%- include('/inc/figure.html', {
    id: 'async-programming-chained',
    img: '/static/tools-small.jpg',
    alt: 'Chained promises',
    cap: 'Chaining promises to make asynchronous operations depend on each other.',
    fixme: true
}) %>

We therefore have three rules for chaining promises:

1.  If our code can run synchronously, just put it in `then`.

1.  If we want to use our own asynchronous function,
    it must create and return a promise.

1.  Finally,
    if we want to use a library function that relies on callbacks,
    we have to convert it to use promises.
    Doing this is called <g key="promisification">promisification</g>,
    and most functions in the [Node][nodejs] have already been promisified.

## How can we build tools with promises?

Promises may seem more complex than callbacks right now,
but that's because we're looking at how they work rather than at how to use them.
To explore the latter,
let's use promises to build a line-counting program.
We will rely on the promisified version of `fs-extra` for file operations.

Our first step is to count the lines in a single file:

<%- include('/inc/multi.html', {pat: 'count-lines-single-file.*', fill: 'js sh out'}) %>

::: callout
### Character encoding

A <g key="character_encoding">character encoding</g> specifies how characters are stored as bytes.
The most widely used is <g key="utf_8">UTF-8</g>,
which stores characters common in Western European languages in a single byte
and uses multi-byte sequences for other symbols.
If we don't specify a character encoding,
`fs.readFileAsync` gives us an array of bytes rather than an array of characters.
:::

The next step is to count the lines in multiple files.
We can use `glob-promise` to delay handling the output of `glob`,
but we need some way to create a separate task to count the lines in each file
and to wait until those line counts are available before exiting our program.

The tool we want is `Promise.all`,
which waits until all of the promises in an array have completed.
To make our program a little more readable,
we will put the creation of the promise for each file in a separate function:

<%- include('/inc/multi.html', {pat: 'count-lines-globbed-files.*', fill: 'js sh slice.out'}) %>

However,
we want to display the names of the files whose lines we're counting along with the counts.
To do this we have to return two values from our `then`.
We could put them in an array,
but it's better practice to construct a temporary object with named fields
(<f key="async-programming-temporary-named-fields"></f>).
This approach allows us to add or rearrange fields without breaking code
and also serves as a bit of documentation.
With this change
our line-counting program becomes:

<%- include('/inc/file.html', {file: 'count-lines-print-filenames.js'}) %>

<%- include('/inc/figure.html', {
    id: 'async-programming-temporary-named-fields',
    img: '/static/tools-small.jpg',
    alt: 'Temporary objects with named fields',
    cap: 'Creating temporary objects with named fields to carry values forward.',
    fixme: true
}) %>

As in <x key="systems-programming">the previous chapter</x>,
this works until we run into a directory whose name name matches `*.*`,
which we do in `node_modules`.
The solution once again is to use `stat` to check if something is a file or not
before trying to read it.
And since `stat` returns an object that doesn't include the file's name,
we create another temporary object to pass information down the chain of `then`s.

<%- include('/inc/multi.html', {pat: 'count-lines-with-stat.*', fill: 'js sh slice.out'}) %>

::: continue
This code is complex, but a lot simpler than it would be if we were using callbacks.
:::

::: callout
## Lining things up

One trick this code uses that we haven't seen before is
to create an object using variable names as both keys and values.
The expression `{filename, stats}` creates an object whose keys are `filename` and `stats`,
and whose values are the values of the corresponding variables.
Doing this makes the code easier to read,
both because it's shorter
but also because it signals that the value associated with the key `filename`
is exactly the value of the variable with the same name.
:::

## How can we make this more readable?

Promises eliminate the deep nesting associated with callbacks of callbacks,
but they are still hard to follow.
The latest versions of JavaScript provide two new keywords called `async` and `await`
to flatten code further.
`async` means "this function implicitly returns a promise",
while `await` means "wait for a promise to resolve".
This short program uses both keywords to print the first ten characters of a file:

<%- include('/inc/multi.html', {pat: 'await-fs.*', fill: 'js out'}) %>

::: callout
### Translating code

When [Node][nodejs] sees `await` and `async`
it silently converts the code to use promises with `then`, `resolve`, and `reject`;
we will see how this is done in <x key="code-generator"></x>.
In order to provide a context for this,
we can only use `await` inside a function that is declared to be `async`:
we can't put a statement like `await fs.statAsync(…)` at the top level of our program
outside a function.
:::

To see how much cleaner our code is with `await` and `async`,
let's rewrite our line counting program to use them.
First,
we modify the two helper functions to look like they're waiting for results and returning them.
They actually wrap their results in promises and return those,
but [Node][nodejs] now takes care of that for us:

<%- include('/inc/keep.html', {file: 'count-lines-with-stat-async.js', key: 'recycle'}) %>

Next,
we modify `main` to wait for things to complete.
We must still use `Promise.all` to handle the promises
that are counting lines for individual files,
but the result is less cluttered than our previous version.

<%- include('/inc/keep.html', {file: 'count-lines-with-stat-async.js', key: 'main'}) %>

## How can we handle errors with asynchronous code?

We created several intermediate variables in the line-counting program to make the steps clearer.
Doing this also helps with error handling:
to see how,
we will build up an xample in stages.

First,
if we return a promise that fails without using `await`,
then our main function will finish running before the error occurs,
and our `try`/`catch` doesn't help us
(<f key="async-programming-handling-errors"></f>):

<%- include('/inc/multi.html', {pat: 'return-immediately.*', fill: 'js out'}) %>

<%- include('/inc/figure.html', {
    id: 'async-programming-handling-errors',
    img: '/static/tools-small.jpg',
    alt: 'Handling asynchronous errors',
    cap: 'Wrong and right ways to handle errors in asynchronous code.',
    fixme: true
}) %>

One solution to this problem is to be consistent and always return something.
Because the function is declared `async`,
the `Error` in the code below is automatically wrapped in a promise
so we can use `.then` and `.catch` to handle it as before:

<%- include('/inc/multi.html', {pat: 'assign-immediately.*', fill: 'js out'}) %>

If instead we `return await`,
the function waits until the promise runs before returning.
The promise is turned into an exception because it failed,
and since we're inside the scope of our `try`/`catch` block,
everything works as we want:

<%- include('/inc/multi.html', {pat: 'return-await.*', fill: 'js out'}) %>

::: continue
We prefer the second approach,
but whichever you choose,
please be consistent.
:::
