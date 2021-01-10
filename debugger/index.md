---
---

We have finally come to the subject that sparked this book:
how does a debugger work?
Debuggers are as much a part of good programmers' lives as version control
but are taught far less often
(in part, we believe, because it's harder to create homework questions for them).
In this chapter we will build a simple single-stepping debugger
and show how to test interactive applications.

## What is our starting point?

We would like to debug a higher-level language than the assembly code of <x key="virtual-machine"></x>,
but we don't want to have to write a parser
or wrestle with the ASTs of <x key="style-checker"></x>.
As a compromise,
we will represent programs as simple JSON data structures
in which every element is `[command ...args]`:

<%- include('/inc/file.html', {file: 'filter-base.json'}) %>

Our virtual machine is structured like the one in <x key="virtual-machine"></x>.
A real system would parse a program to create JSON,
then translate JSON into assembly code,
then assemble that to create machine instructions.
Again,
to keep things simple we will execute a program by
removing comments and blank lines
and then running commands by looking up the command name's and calling that method:

<%- include('/inc/erase.html', {file: 'vm-base.js', key: 'skip'}) %>

The method implementing definition of a new variable with an initial value looks like this:

<%- include('/inc/keep.html', {file: 'vm-base.js', key: 'defV'}) %>

::: continue
while adding two values looks like this:
:::

<%- include('/inc/keep.html', {file: 'vm-base.js', key: 'add'}) %>

Running a `while` loop is:

<%- include('/inc/keep.html', {file: 'vm-base.js', key: 'loop'}) %>

::: continue
and checking that a variable name refers to an array is:
:::

<%- include('/inc/keep.html', {file: 'vm-base.js', key: 'checkArray'}) %>

The other operations are similar to these.

## How can we make a tracing debugger?

We start by building a <g key="source_map">source map</g>
that keeps track of where in the source file each instruction came from.
If we parsed our JSON with [Acorn][acorn] we would get line numbers,
but then we would have to scrape out the information we want for this example.
We will therefore cheat and add a line number to each interesting statement by hand
so that our program looks like this:

<%- include('/inc/keep.html', {file: 'filter-source-map.json', key: 'program'}) %>

Building the source map from that is simple:
we just modify `exec` to ignore the line number for now:

<%- include('/inc/file.html', {file: 'vm-source-map.js'}) %>

The next step is to modify `exec` to call a callback function for each significant operation,
where "significant" means "we bothered to record its line number".
We give this callback the environment holding the current set of variables,
the line number,
and the operation being performed.

<%- include('/inc/file.html', {file: 'vm-callback.js'}) %>

We also modify the constructor to record the debugger and give it a reference to the virtual machine
(<f key="virtual-machine-initialization"></f>).
We have to connect the two objects explicitly because
each one needs a reference to the other,
but one of them has to be created first.
"A gets B then B tells A about itself" is a common pattern;
we will look at other ways to manage it in the exercises.

<%- include('/inc/figure.html', {
    id: 'virtual-machine-initialization',
    img: '/static/tools-small.jpg',
    alt: 'Initializing mutually-depending objects',
    cap: 'Two-step initialization of mutually-dependent objects.',
    fixme: true
}) %>

To run the program,
we create a debugger object and pass it in:

<%- include('/inc/file.html', {file: 'run-debugger.js'}) %>

A simple debugger just traces statements as they run:

<%- include('/inc/file.html', {file: 'debugger-trace.js'}) %>

Let's try it on a smaller program than our filtering example:

<%- include('/inc/file.html', {file: 'sum-source-map.json'}) %>
<%- include('/inc/file.html', {file: 'sum-source-map-trace.out'}) %>

## How can we make the debugger interactive?

The next step is to make the debugger interactive.
We will use [`prompt-sync`][node-prompt-sync] to manage user input,
and will accept a simple set of commands:

-   `?` or `help` to list commands.

-   `clear #` to clear a <g key="breakpoint">breakpoint</g> at a numbered line.

-   `list` to list lines and breakpoints.

-   `next` to go forward one line.

-   `print name` to show a variable while at a breakpoint.

-   `run` to run to the next breakpoint.

-   `stop #` to break at a numbered line.

-   `variables` to list all variable names.

-   `exit` to exit immediately.

When the virtual machine calls the debugger,
the debugger first checks whether or not it is on a numbered line.
If it is,
it hands control back to the VM.
Otherwise,
its action depends on our current state:

1.  If we are single-stepping, the debugger interacts with the user.

2.  We also interact if this line is a breakpoint.

3.  Otherwise, it does nothing.

The overall structure of the interactive debugger is shown below:

<%- include('/inc/erase.html', {file: 'debugger-interactive.js', key: 'skip'}) %>

It interacts with users by lookup up a command and invoking the corresponding method,
just as the VM does:

<%- include('/inc/keep.html', {file: 'debugger-interactive.js', key: 'interact'}) %>

::: continue
We didn't originally put the input and output in methods that could be overridden,
but realized later we needed to do this for testing purposes.
Rather than coming back and rewriting this,
we have done it here.
:::

With this structure in place,
the command handlers are pretty straightforward.
For example,
this moves us to the next line:

<%- include('/inc/keep.html', {file: 'debugger-interactive.js', key: 'next'}) %>

::: continue
and this prints the value of a variable:
:::

<%- include('/inc/keep.html', {file: 'debugger-interactive.js', key: 'print'}) %>

After using this for a few moments,
though
we realized that we needed to change the signature of the `loop` method.
We want to stop the loop each time it runs,
and need to know where we are.
We didn't allow for this in the base class,
and we don't want to have to change every method,
so we take advantage of the fact that JavaScript ignores any extra arguments passed to a method.
This is sloppy, but it works;
we will tidy it up in the exercises.

<%- include('/inc/file.html', {file: 'vm-interactive.js'}) %>

## How can we test an interactive application?

How can we test an interactive application like a debugger?
The answer is, "By making it non-interactive."
Like many other tools over the past thirty years,
our approach is based on a program called [Expect][expect].
Our library replaces the input and output functions of the subject application with callbacks,
then provides input when asked and checks output when it is given
(<f key="virtual-machine-test-interact"></f>).

<%- include('/inc/figure.html', {
    id: 'virtual-machine-test-interact',
    img: '/static/tools-small.jpg',
    alt: 'Testing interactive application',
    cap: 'Replacing input and output to test interactive applications.',
    fixme: true
}) %>

The results look like this:

<%- include('/inc/keep.html', {file: 'test/test-expect.js', key: 'tests'}) %>

Our `Expect` class may be short,
but it is hard to understand because it is so abstract:

<%- include('/inc/file.html', {file: 'expect.js'}) %>

Piece by piece:

-   `subject` is the thing being tested.
-   `start` is a callback to start the system running.
    It gives control to the subject,
    which then calls back into the test framework for input and output.
-   `get` and `send` store things to be given to the subject
    and to be checked against its output.
    Both methods return `this` so that we can chain calls together.
-   `run` starts the system
    and checks that all expected interactions have been used up when testing is done.
-   `toSystem` and `fromSystem` use `next` to get the next test record,
    check its type,
    and return the string.

Let's modify the debugger to use the tester,
keeping in mind that the prompt counts as an output
(and yes, we forgot this in the first version):

<%- include('/inc/file.html', {file: 'debugger-test.js'}) %>

Again,
we can't pass the tester as a constructor parameter because of initialization order,
so we write a `setup` function to make sure everything is connected the right way:

<%- include('/inc/keep.html', {file: 'test/test-expect.js', key: 'setup'}) %>

Let's try running our tests:

<%- include('/inc/multi.html', {pat: 'test-expect.*', fill: 'sh out'}) %>

That works---or does it?
Why is only one test shown,
and doesn't the summary appear?
After a bit of digging,
we realize that the debugger's `exit` command calls `process.exit` when the simulated program ends,
so the whole program (including the VM, debugger, and test framework) stops immediately
*before* the promises that contain the tests have run.

We could fix this by modifying the debugger callback
to return an indication of whether or not execution should continue,
then modify the VM to pay attention to that flag.
However,
this approach becomes very complicated when we have deeply-nested calls to `exec`,
which will happen with loops and conditionals.

A better alternative is to use an exception for control flow.
We can define our own kind of exception as an empty class:
it doesn't need any data
because we are only using it to get a typed object:

<%- include('/inc/file.html', {file: 'halt-exception.js'}) %>

Next,
we modify the debugger to throw this exception when asked to exit:

<%- include('/inc/file.html', {file: 'debugger-exit.js'}) %>

And finally
we modify the VM to finish cleanly if this exception is thrown,
but re-throw any other kind of exception:

<%- include('/inc/file.html', {file: 'vm-exit.js'}) %>

With these changes in place,
we are finally able to test our interactive debugger:

<%- include('/inc/multi.html', {pat: 'test-exit.*', fill: 'sh out'}) %>
