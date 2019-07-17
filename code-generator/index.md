---
---

Code coverage like [Istanbul][istanbul] to show what has and hasn't been tested.

## How can I generate JavaScript? {#generating}

-   Use `escodegen` to turn an `acorn` parse tree back into code
    -   Creates program text but does not run it
-   Look at the `acorn` parse tree for a simple function definition

{% include wildcard.md pattern="func-def.*" values="js,text" %}

-   Pick out the node(s) of interest and reverse engineer them

{% include wildcard.md pattern="one-plus-two.*" values="js,text" %}

## How can I count how often functions are executed? {#counting}

-   Find all function declaration nodes
-   Insert a node to increment an entry in a global variable `__counters`

{% include wildcard.md pattern="multi-func-counter.*" values="js,text" %}

## How can I replace a function with another function? {#replacing}

-   Use `...args` to capture and forward all arguments
-   Handle and re-throw all errors

{% include wildcard.md pattern="replace-func.*" values="js,text" %}

## How can I time function execution? {#timing}

-   Find all the function declarations
-   Create a wrapper that
    -   Records the start time
    -   Calls the original function
    -   Records the difference between the start time and the end time
-   Then replace a placeholder definition of `originalFunc` in the wrapper with the actual function definition

{% include file.md file="time-func.js" %}

-   A quick test

{% include wildcard.md pattern="test-time-func.*" values="js,text" %}

{% include links.md %}
