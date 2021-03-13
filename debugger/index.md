---
---

We have finally come to the subject that sparked this book:
how does a debugger work?
Debuggers are as much a part of good programmers' lives as version control
but are taught far less often
(in part, we believe, because it's harder to create homework questions for them).
In this chapter we will build a simple single-stepping debugger;
in doing so,
we will show one way to test interactive applications (<span x="unit-test"></span>).

## What is our starting point?

We would like to debug a higher-level language than the assembly code of <span x="virtual-machine"></span>,
but we don't want to have to write a parser
or wrestle with the ASTs of <span x="style-checker"></span>.
As a compromise,
we will represent programs as simple JSON data structures
in which every element has the form `[command ...args]`:

{% include file file='filter-base.json' %}

Our virtual machine is structured like the one in <span x="virtual-machine"></span>.
A real system would parse a program to create JSON,
then translate JSON into assembly code,
then assemble that to create machine instructions.
Again,
to keep things simple we will execute a program by
removing comments and blank lines
and then running commands by looking up the command name's and calling that method:

{% include erase file='vm-base.js' key='skip' %}

{: .continue}
Remember, functions and methods are just another kind of data,
so if an object has a method called `"meth"`,
the expression `this["meth"]` will look it up
and the expression `this["meth"](args)` will call it.
If the string `"meth"` is stored in a variable called `name`,
then `this[name](args)` will do exactly the same thing.

The method in our VM that defines a new variable with an initial value looks like this:

{% include keep file='vm-base.js' key='defV' %}

{: .continue}
while the one that adds two values looks like this:

{% include keep file='vm-base.js' key='add' %}

Running a `while` loop is:

{% include keep file='vm-base.js' key='loop' %}

{: .continue}
and checking that a variable name refers to an array is:

{% include keep file='vm-base.js' key='checkArray' %}

The other operations are similar to these.

## How can we make a tracing debugger?

The next thing we need in our debugger is
a <span g="source_map">source map</span> that keeps track of
where in the source file each instruction came from.
Since JSON is a subset of JavaScript,
we could get line numbers by parsing our programs with [Acorn][acorn].
However,
we would then have to scrape the information we want for this example out of the AST.
Since this chapter is supposed to be about debugging,
not parsing,
we will instead cheat and add a line number to each interesting statement by hand
so that our program looks like this:

{% include keep file='filter-source-map.json' key='program' %}

Building the source map from that is simple;
for now,
we just modify `exec` to ignore the line number:

{% include file file='vm-source-map.js' %}

The next step is to modify the VM's `exec` method
so that it executes a callback function for each significant operation
(where "significant" means "we bothered to record its line number").
Since we're not sure what our debugger is going to need,
we give this callback the environment holding the current set of variables,
the line number,
and the operation being performed:

{% include file file='vm-callback.js' %}

We also modify the VM's constructor to record the debugger and give it a reference to the virtual machine
(<span f="debugger-initialization"></span>).
We have to connect the two objects explicitly because
each one needs a reference to the other,
but one of them has to be created first.
"A gets B then B tells A about itself" is a common pattern;
we will look at other ways to manage it in the exercises.

{% include figure id='debugger-initialization' img='figures/initialization.svg' alt='Initializing mutually-depending objects' cap='Two-step initialization of mutually-dependent objects.' %}

To run the program,
we create a debugger object and pass it to the VM's constructor:

{% include file file='run-debugger.js' %}

A simple debugger just traces interesting statements as they run:

{% include file file='debugger-trace.js' %}

Let's try it on a program that adds the numbers in an array:

{% include file file='sum-source-map.json' %}
{% include file file='sum-source-map-trace.out' %}

## How can we make the debugger interactive?

What we have built so far is an always-on `print` statement.
To turn it into an interactive debugger,
we will use the [`prompt-sync`][node-prompt-sync] module to manage user input
with the following set of commands:

-   `?` or `help` to list commands.

-   `clear #` to clear a <span g="breakpoint">breakpoint</span> at a numbered line.

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

{% include erase file='debugger-interactive.js' key='skip' %}

It interacts with users by lookup up a command and invoking the corresponding method,
just as the VM does:

{% include keep file='debugger-interactive.js' key='interact' %}

<div class="callout" markdown="1">
### Learning as we go

We didn't originally put the input and output in methods that could be overridden,
but realized later we needed to do this to make the debugger testable.
Rather than coming back and rewriting this,
we have done it here.

</div>

With this structure in place,
the command handlers are pretty straightforward.
For example,
this method moves us to the next line:

{% include keep file='debugger-interactive.js' key='next' %}

{: .continue}
while this one prints the value of a variable:

{% include keep file='debugger-interactive.js' key='print' %}

After using this for a few moments,
though
we realized that we needed to change the signature of the `loop` method.
We want to stop the loop each time it runs,
and need to know where we are.
We didn't allow for this in the base class,
and we don't want to have to change every method,
so we take advantage of the fact that JavaScript ignores any extra arguments passed to a method:

{% include file file='vm-interactive.js' %}

{: .continue}
This is sloppy, but it works;
we will tidy it up in the exercises.

## How can we test an interactive application?

How can we test an interactive application like a debugger?
The answer is, "By making it non-interactive."
Like many tools over the past thirty years,
our approach is based on a program called [Expect][expect].
Our library replaces the input and output functions of the application being tested with callbacks,
then provides input when asked and checks output when it is given
(<span f="debugger-test-interact"></span>).

{% include figure id='debugger-test-interact' img='figures/test-interact.svg' alt='Testing interactive application' cap='Replacing input and output to test interactive applications.' %}

{: .continue}
The results look like this:

{% include keep file='test/test-expect.js' key='tests' %}

Our `Expect` class may be short,
but it is hard to understand because it is so abstract:

{% include file file='expect.js' %}

{: .continue}
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

{% include file file='debugger-test.js' %}

Again,
we can't pass the tester as a constructor parameter because of initialization order,
so we write a `setup` function to make sure everything is connected the right way:

{% include keep file='test/test-expect.js' key='setup' %}

Let's try running our tests:

{% include multi pat='test-expect.*' fill='sh out' %}

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

{% include file file='halt-exception.js' %}

{: .continue}
Next,
we modify the debugger to throw this exception when asked to exit:

{% include file file='debugger-exit.js' %}

{: .continue}
And finally
we modify the VM to finish cleanly if this exception is thrown,
but re-throw any other kind of exception:

{% include file file='vm-exit.js' %}

With these changes in place,
we are finally able to test our interactive debugger:

{% include multi pat='test-exit.*' fill='sh out' %}
