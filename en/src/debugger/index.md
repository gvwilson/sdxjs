---
title: "Debugger"
---
We have finally come to one of the topics that sparked this book:
how does a [%i "debugger" %]debugger[%/i%] work?
(The other was layout engines, discussed in [%x layout-engine %].)
Debuggers are as much a part of good programmers' lives as version control
but are taught far less often
(in part, we believe, because it's harder to create homework questions for them).
In this chapter we will build a simple single-stepping debugger;
in doing so,
we will show one way to test interactive applications ([%x unit-test %]).

## What is our starting point? {: #debugger-start}

We would like to debug a higher-level language than the [%i "assembly code" %]assembly code[%/i%] of [%x virtual-machine %],
but we don't want to have to write a parser
or wrestle with the [%i "abstract syntax tree" %]ASTs[%/i%] of [%x style-checker %].
As a compromise,
we will represent programs as JSON data structures
whose element have the form `[command ...args]`:

[% inc file="filter-base.json" %]

Our [%i "virtual machine" %]virtual machine[%/i%] is structured like the one in [%x virtual-machine %].
A real system would parse a program to create JSON,
then translate JSON into assembly code,
then assemble that to create machine instructions.
Again,
to keep things simple we will execute a program by
removing comments and blank lines
and then running commands by looking up the command name's and calling that method:

[% inc file="vm-base.js" omit="skip" %]

Remember, functions and methods are just another kind of data,
so if an object has a method called `"meth"`,
the expression `this["meth"]` looks it up
and `this["meth"](args)` calls it.
If `"meth"` is stored in a variable called `name`,
then `this[name](args)` will do exactly the same thing.
{: .continue}

The method in our VM that defines a new variable with an initial value looks like this:

[% inc file="vm-base.js" keep="defV" %]

while the one that adds two values looks like this:
{: .continue}

[% inc file="vm-base.js" keep="add" %]

Running a `while` loop is:

[% inc file="vm-base.js" keep="loop" %]

and checking that a variable name refers to an array is:
{: .continue}

[% inc file="vm-base.js" keep="checkArray" %]

The other operations are similar to these.

## How can we make a tracing debugger? {: #debugger-tracing}

The next thing we need in our debugger is
a [%i "source map" "debugger!source map" %][%g source_map "source map" %][%/i%] that keeps track of
where in the source file each instruction came from.
Since JSON is a subset of JavaScript,
we could get line numbers by parsing our programs with [%i "Acorn" %][Acorn][acorn][%/i%].
However,
we would then have to scrape the information we want for this example out of the AST.
Since this chapter is supposed to be about debugging,
not parsing,
we will instead cheat and add a line number to each interesting statement by hand
so that our program looks like this:

[% inc file="filter-source-map.json" keep="program" %]

Building the source map from that is simple;
for now,
we just modify `exec` to ignore the line number:

[% inc file="vm-source-map.js" %]

> ### It's not really cheating
>
> We said that adding line numbers by hand was cheating,
> but it isn't.
> What we're actually doing is deferring a problem until we're sure we need to solve it.
> If our approach is clumsy or fails outright because of some aspect of design we didn't foresee,
> there will have been no point handling line numbers the "right" way.
> A good rule for [%i "software design!deferring problems" %]software design[%/i%]
> is to tackle the thing you're least sure about first,
> using temporary code in place of what you think you'll eventually need.

The next step is to modify the VM's `exec` method
so that it executes a callback function for each significant operation
(where "significant" means "we bothered to record its line number").
Since we're not sure what our debugger is going to need,
we give this callback the environment holding the current set of variables,
the line number,
and the operation being performed:

[% inc file="vm-callback.js" %]

We also modify the VM's constructor to record the debugger and give it a reference to the virtual machine
([%f debugger-initialization %]).
We have to [%i "mutual references" %]connect the two objects explicitly[%/i%]
because each one needs a reference to the other,
but one of them has to be created first.
"A gets B then B tells A about itself" is a common pattern;
we will look at other ways to manage it in the exercises.

[% figure
   slug="debugger-initialization"
   img="initialization.svg"
   alt="Initializing mutually-depending objects"
   caption="Two-step initialization of mutually-dependent objects."
%]

To run the program,
we create a debugger object and pass it to the VM's constructor:

[% inc file="run-debugger.js" %]

A simple debugger just traces interesting statements as they run:

[% inc file="debugger-trace.js" %]

Let's try it on a program that adds the numbers in an array:

[% inc file="sum-source-map.json" %]
[% inc file="sum-source-map-trace.out" %]

## How can we make the debugger interactive? {: #debugger-interactive}

What we have built so far is an always-on `print` statement.
To turn it into an interactive debugger,
we will use the [`prompt-sync`][node-prompt-sync] module to manage user input
with the following set of commands:

-   `?` or `help` to list commands.

-   `clear #` to clear a [%g breakpoint "breakpoint" %] at a numbered line.

-   `list` to list lines and breakpoints.

-   `next` to go forward one line.

-   `print name` to show a variable while at a breakpoint.

-   `run` to run to the next breakpoint.

-   `stop #` to break at a numbered line.

-   `variables` to list all variable names.

-   `exit` to exit immediately.

When the virtual machine calls the debugger,
the debugger first checks whether or not it is on a numbered line.
If it isn't,
it hands control back to the VM.
Otherwise,
its action depends on our current state.
If we are single-stepping or if this line is a breakpoint,
Otherwise, it does nothing.

The overall structure of the interactive debugger is:

[% inc file="debugger-interactive.js" omit="skip" %]

It interacts with users by lookup up a command and invoking the corresponding method,
just as the VM does:
{: .continue}

[% inc file="debugger-interactive.js" keep="interact" %]

> ### Learning as we go
>
> We didn't originally put the input and output in methods that could be overridden,
> but realized later we needed to do this to make the debugger testable.
> Rather than coming back and rewriting this,
> we have done it here.

With this structure in place,
the command handlers are pretty straightforward.
For example,
this method moves us to the next line:

[% inc file="debugger-interactive.js" keep="next" %]

while this one prints the value of a variable:
{: .continue}

[% inc file="debugger-interactive.js" keep="print" %]

After using this for a few moments,
though
we realized that we needed to change the signature of the `loop` method.
We want to stop the loop each time it runs,
and need to know where we are.
We didn't allow for this in the base class,
and we don't want to have to change every method,
so we take advantage of the fact that JavaScript ignores any extra arguments passed to a method:

[% inc file="vm-interactive.js" %]

This is sloppy, but it works;
we will tidy it up in the exercises.
{: .continue}

## How can we test an interactive application? {: #debugger-test}

How can we [%i "unit test!interactive application" %]test[%/i%] an interactive application like a debugger?
The answer is, "By making it non-interactive."
Like many tools over the past thirty years,
our approach is based on a program called [%i "Expect" %][Expect][expect][%/i%].
Our library replaces the input and output functions of the application being tested with callbacks,
then provides input when asked and checks output when it is given
([%f debugger-test-interact %]).

[% figure
   slug="debugger-test-interact"
   img="test-interact.svg"
   alt="Testing interactive application"
   caption="Replacing input and output to test interactive applications."
%]

The results look like this:
{: .continue}

[% inc file="test/test-expect.js" keep="tests" %]

Our `Expect` class may be short,
but it is hard to understand because it is so abstract:

[% inc file="expect.js" %]

Piece by piece:
{: .continue}

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

[% inc file="debugger-test.js" %]

Again,
we can't pass the tester as a constructor parameter because of initialization order,
so we write a `setup` function to make sure everything is connected the right way:

[% inc file="test/test-expect.js" keep="setup" %]

Let's try running our tests:

[% inc pat="test-expect.*" fill="sh out" %]

That works---or does it?
Why is only one test shown,
and doesn't the summary appear?
After a bit of digging,
we realize that the debugger's `exit` command calls `process.exit` when the simulated program ends,
so the whole program including the VM, debugger, and test framework stops immediately
*before* the promises that contain the tests have run.

We could fix this by modifying the debugger callback
to return an indication of whether or not execution should continue,
then modify the VM to pay attention to that flag.
However,
this approach becomes very complicated when we have deeply-nested calls to `exec`,
which will happen with loops and conditionals.

A better alternative is to use an [%i "exception!for control flow" %]exception for control flow[%/i%].
We can define our own kind of exception as an empty class:
it doesn't need any data
because we are only using it to get a typed object:

[% inc file="halt-exception.js" %]

Next,
we modify the debugger to throw this exception when asked to exit:
{: .continue}

[% inc file="debugger-exit.js" %]

And finally
we modify the VM to finish cleanly if this exception is thrown,
but re-throw any other kind of exception:
{: .continue}

[% inc file="vm-exit.js" %]

With these changes in place,
we are finally able to test our interactive debugger:

[% inc pat="test-exit.*" fill="sh out" %]

## Exercises {: #debugger-exercises}

### Implementing tab completion {: .exercise}

Read the documentation for [`prompt-sync`][node-prompt-sync]
and then implement [%g tab_completion "tab completion" %]
for the debugger.

### Modifying variables while running {: .exercise}

Add a `set` command that sets the value of a variable to a new value in a running program.
How do you handle setting array elements?

### Making output more readable {: .exercise}

Modify the tracing debugger so that
the statements inside loops and conditionals are indented for easier reading.

### Better loops {: .exercise}

Our solution for handling loops is sloppy; fix it.

### Using a flag to continue execution {: .exercise}

Modify the debugger and virtual machine to use a "continue executing" flag
rather than throwing an exception when execution should end.
Which approach is easier to understand?
Which will be easier to extend in future?

### Numbering lines {: .exercise}

Write a tool that takes a JSON program representation *without* statement numbers
and produces one that numbers all of the interesting statements for debugging purposes.
Use whatever definition of "interesting" you think would be most useful.

### Looping around again {: .exercise}

Implement a "next loop iteration" command that runs the program
until it reaches the current point in the next iteration of the current loop.

### Looking up objects {: .exercise}

Rather than having some objects call `setXYZ` methods in other objects,
it is common practice to use a lookup table for mutual dependencies:

1.  Every object initializes calls `table.set(name, this)` in its constructor.

2.  Whenever object A needs the instance of object B,
    it calls `table.lookup('B')`.
    It does *not* store the result in a member variable.

Modify the virtual machine and debugger to use this pattern.

### Watching for variable changes {: .exercise}

Modify the debugger and virtual machine to implement [%g watchpoint "watchpoints" %]
that halt the program whenever the value of a variable changes.

### Translating JSON to assembler {: .exercise}

Write a tool that translates the JSON program representation
into the assembly code of [%x virtual-machine %].
To simplify things,
increase the number of registers so that
there is always storage for intermediate results
when doing arithmetic.
