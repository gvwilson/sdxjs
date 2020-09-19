---
---

Code coverage like [Istanbul][istanbul] to show what has and hasn't been tested.

## How can I generate JavaScript?

-   Use `escodegen` to turn an `acorn` parse tree back into code
    -   Creates program text but does not run it
-   Look at the `acorn` parse tree for a simple function definition

<%- include('/_inc/multi.html', {pat: 'func-def.*', fill: 'js text'}) %>

-   Pick out the node(s) of interest and reverse engineer them

<%- include('/_inc/multi.html', {pat: 'one-plus-two.*', fill: 'js text'}) %>

## How can I count how often functions are executed?

-   Find all function declaration nodes
-   Insert a node to increment an entry in a global variable `__counters`

<%- include('/_inc/multi.html', {pat: 'multi-func-counter.*', fill: 'js text'}) %>

## How can I replace a function with another function?

-   Use `...args` to capture and forward all arguments
-   Handle and re-throw all errors

<%- include('/_inc/multi.html', {pat: 'replace-func.*', fill: 'js text'}) %>

## How can I time function execution?

-   Find all the function declarations
-   Create a wrapper that
    -   Records the start time
    -   Calls the original function
    -   Records the difference between the start time and the end time
-   Then replace a placeholder definition of `originalFunc` in the wrapper with the actual function definition

<%- include('/_inc/code.html', {file: 'time-func.js'}) %>

-   A quick test

<%- include('/_inc/multi.html', {pat: 'test-time-func.*', fill: 'js text'}) %>
