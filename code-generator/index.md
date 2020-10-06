---
---

-   Goal: figure out which parts of our code have and haven't been tested
-   Build a <g key="code_coverage">code coverage</g> tool modeled on [Istanbul][istanbul]
    -   Ours will keep track of which functions have(n't) been called
    -   More sophisticated ones report coverage line-by-line
    -   And can also keep track of which tests in multi-part `if` statements were responsible for execution

## How can we replace a function with another function?

-   Use `...args` to capture all arguments and forward them to the original function
-   This example handles and re-throws all errors

<%- include('/inc/multi.html', {pat: 'replace-func.*', fill: 'js text'}) %>

-   This is an example of the <g key="decorator_pattern">Decorator</g> pattern
    -   A function whose job is to modify the behavior of other functions
-   We could use it to solve our problem, but we would have to apply it to every one of our functions
-   What we really want is a way to do this automatically for everything

## How can we generate JavaScript?

-   Two basic strategies
    -   Generate code and modify that
    -   Modify a temporary copy of the source and then generate code
-   We can't use the first approach
    because JavaScript doesn't save the generated <g key="byte_code">byte code</g> for us to play with
-   Could try to do the second with <g key="regular_expression">regular expressions</g>,
    but it's astonishing how irregular real-world code can be
-   Adopt an intermediate approach
    -   Parse the JavaScript with [Acorn][acorn] to create an <g key="abstract_syntax_tree">AST</g>
    -   Modify the AST
    -   Use [Escodegen][escodegen] to turn the AST back into JavaScript
    -   Code is just another kind of data...
-   Look at the Acorn parse tree for a simple function definition

<%- include('/inc/multi.html', {pat: 'func-def.*', fill: 'js text'}) %>

-   Pick out some nodes and see if we can generate code from a handmade AST

<%- include('/inc/multi.html', {pat: 'one-plus-two.*', fill: 'js text'}) %>

## How can we count how often functions are executed?

-   Find all function declaration nodes
-   Insert a node to increment an entry in a global variable `__counters`
-   Add text to create the counters

<%- include('/inc/multi.html', {pat: 'multi-func-counter.*', fill: 'js text'}) %>

-   This approach doesn't work if functions can have the same names
    -   Which they can if we use modules or <g key="nested_function">nested functions</g>

## How can we time function execution?

-   Find all the function declarations
-   Create a wrapper that
    -   Records the start time
    -   Calls the original function
    -   Records the difference between the start time and the end time
-   Then replace a placeholder definition of `originalFunc` in the wrapper with the actual function definition

<%- include('/inc/code.html', {file: 'time-func.js'}) %>

-   A quick test

<%- include('/inc/multi.html', {pat: 'test-time-func.*', fill: 'js text'}) %>
