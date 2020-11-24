---
---

## What is our starting point?

-   Assume a parser...
-   Represent program as JSON
    -   Every element is `[command ...args]`

<%- include('/_inc/file.html', {file: 'filter-base.json'}) %>

-   Virtual machine structured like that from <xref key="virtual-machine"></xref>
    -   Real system would parse program to create JSON, then translate JSON into assembly code, then assemble to machine instructions
-   Virtual machine
    -   Remove comments and blank lines
    -   Run all commands by looking up command name and calling that method

<%- include('/_inc/erase.html', {file: 'vm-base.js', tag: 'skip'}) %>

-   Define a new variable with an initial value

<%- include('/_inc/slice.html', {file: 'vm-base.js', tag: 'defV'}) %>

-   Add two values

<%- include('/_inc/slice.html', {file: 'vm-base.js', tag: 'add'}) %>

-   Run a `while` loop

<%- include('/_inc/slice.html', {file: 'vm-base.js', tag: 'loop'}) %>

-   Check that a variable name refers to an array

<%- include('/_inc/slice.html', {file: 'vm-base.js', tag: 'checkArray'}) %>

## How can we make a tracing debugger?

-   First step is to build a <g key="source_map">source map</g>
    -   If we are parsing with [Acorn][acorn] we get line numbers...
    -   ...but then have to scrape out the information we want for this example
-   So we will cheat
    -   Add a line number to each interesting statement

<%- include('/_inc/slice.html', {file: 'filter-source-map.json', tag: 'program'}) %>

-   Build the source map from that
    -   Modify `exec` to ignore the line number for now

<%- include('/_inc/file.html', {file: 'vm-source-map.js'}) %>

-   Next step is to modify the `exec` method to call a callback function for each significant operation
    -   "Significant" meaning "we bothered to record its line number"
    -   Pass in the environment, the line number, and the operation
-   We also modify the constructor to record the debugger and give it a reference to the virtual machine
    -   Each object needs a reference to the other
    -   One of them has to be created first
    -   "A gets B then B tells A about itself" is a common pattern

<%- include('/_inc/file.html', {file: 'vm-callback.js'}) %>

-   To run the program, create a debugger object and pass it in

<%- include('/_inc/file.html', {file: 'run-debugger.js'}) %>

-   A simple debugger traces statements

<%- include('/_inc/file.html', {file: 'debugger-trace.js'}) %>

-   Try it on a smaller program than our filtering example

<%- include('/_inc/file.html', {file: 'sum-source-map.json'}) %>

## How can we make the debugger interactive?

-   Use [`prompt-sync`][node-prompt-sync] for user input
-   Parse a simple set of commands
    -   `?` or `help` to list commands
    -   `clear #` to clear a breakpoint at a numbered line
    -   `list` to list lines and breakpoints
    -   `next` to go forward one line
    -   `print name` to show a variable while at a breakpoint
    -   `run` to run to the next breakpoint
    -   `stop #` to break at a numbered line
    -   `variables` to list all variable names
    -   `exit` to exit immediately
-   When the virtual machine calls the debugger:
    -   If this isn't a numbered line, keep going
    -   If we are single-stepping, interact
    -   If this is a breakpoint, interactive
    -   Otherwise, keep going

<%- include('/_inc/erase.html', {file: 'debugger-interactive.js', tag: 'skip'}) %>

-   Interact by lookup up command and invoking method
    -   Put input and output in methods that can be overridden later for testing purposes

<%- include('/_inc/slice.html', {file: 'debugger-interactive.js', tag: 'interact'}) %>

-   Command handlers are then pretty straightforward
-   Go to next line

<%- include('/_inc/slice.html', {file: 'debugger-interactive.js', tag: 'next'}) %>

-   Print the value of a variable

<%- include('/_inc/slice.html', {file: 'debugger-interactive.js', tag: 'print'}) %>

-   After using it, realized that we needed to change the signature of `loop`
    -   Want to stop the loop each time
    -   Need to know where
    -   Didn't allow for this in the base class
    -   Don't want to have to change every method
    -   So take advantage of JavaScript ignoring extra arguments
    -   Sloppy

<%- include('/_inc/file.html', {file: 'vm-interactive.js'}) %>

## How can we test an interactive application?

-   By making it non-interactive
-   Based (like many other tools) on [Expect][expect]
    -   Replace the input and output functions with callbacks
    -   Provide input when asked
    -   Check output when given
-   Result looks like this:

<%- include('/_inc/slice.html', {file: 'test/test-expect.js', tag: 'tests'}) %>

-   The `Expect` class is simple
    -   But hard to understand because it is so abstract

<%- include('/_inc/file.html', {file: 'expect.js'}) %>

-   `subject` is the thing being tested
-   `start` is a callback to start the system
    -   It is in control, calling the test framework
-   `get` and `send` store things and return `this` for method chaining
-   `run` starts the system and checks that all expected interactions have been used up when testing is done
-   `toSystem` and `fromSystem` use `next` to get the next test record, check its type, and return the string
-   Modify the debugger to use the tester
    -   Have to remember that the prompt counts as an output (yes, we forgot this)

<%- include('/_inc/file.html', {file: 'debugger-test.js'}) %>

-   Can't pass the tester as a constructor parameter because of initialization order
-   Go back to the test file and look at `setup`

<%- include('/_inc/slice.html', {file: 'test/test-expect.js', tag: 'setup'}) %>

-   Run it

<%- include('/_inc/multi.html', {pat: 'test-expect.*', fill: 'sh out'}) %>

-   And it works---or does it?
    -   Why is only one test shown?
    -   Why doesn't the summary appear?
-   The debugger's `exit` command calls `process.exit`, so the whole program stops immediately
-   Could modify the debugger callback to return an indication of whether or not execution should continue
-   Then modify the VM to pay attention to that flag
    -   Even when it appears in a deeply-nested call to `exec` (which will happen with loops and conditionals)
-   Alternative is to use an exception for control flow
-   Define our own exception class
    -   Doesn't need any data---just using it to get a typed object

<%- include('/_inc/file.html', {file: 'halt-exception.js'}) %>

-   Modify the debugger to throw this exception when asked to exit

<%- include('/_inc/file.html', {file: 'debugger-exit.js'}) %>

-   Modify the VM to finish cleanly if this exception is thrown, but re-throw any other kind of exception

<%- include('/_inc/file.html', {file: 'vm-exit.js'}) %>

-   Run it

<%- include('/_inc/multi.html', {pat: 'test-exit.*', fill: 'sh out'}) %>
