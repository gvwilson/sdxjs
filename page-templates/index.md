---
---

-   Goal: expand HTML templates to create web pages.
    -   Option 1: put JavaScript directly in the page like [EJS][ejs]
    -   Option 2: use a mini-language like [Jekyll][jekyll]
    -   Option 3: use specially-named attributes in HTML
-   We'll use Option 3 because it saves us writing a parser, and because it's unusual
-   Design:
    -   Walk the <g key="dom">DOM</g> to find nodes with special attributes
    -   "Execute" the instructions in those nodes to generate text
    -   Save other text as-is

-   What will a templated page look like?

<%- include('/inc/html.html', {file: 'input-loop.html'}) %>

## How can we transform templates?

-   How will we transform it?
    -   Take a template, an output stream, and some variables (e.g., from <g key="yaml">YAML</g> header)
    -   Pass values in as an object

<%- include('/inc/code.html', {file: 'example-call.js'}) %>

-   What will it generate?

<%- include('/inc/html.html', {file: 'output-loop.html'}) %>

## How can we keep track of values?

-   Need a way to keep track of variables' values
-   Maintain a stack of lookup tables
    -   Each <g key="stack_frame">stack frame</g> is an object
    -   `Env.find` looks up the list of stack frames
    -   This is <g key="dynamic_scoping">dynamic scoping</g> not <g key="lexical_scoping">lexical scoping</g>

<%- include('/inc/code.html', {file: 'env.js'}) %>

-   Structure is defined by our HTML parser
-   Handle nodes with and without children using the <g key="visitor_pattern">Visitor pattern</g>
    -   `Visitor.walk()` without an argument assigns `undefined` to `node`, so we re-set to the root of the tree
    -   Alternative designs would be build-and-run or pass in the root with every call

<%- include('/inc/code.html', {file: 'visitor.js'}) %>

## How do we handle each type of node?

-   What do we do with each node?
    -   Text: copy to output
    -   Node with `q-num` attribute: constant
    -   Node with `q-var` attribute: look up variable and output its value
    -   Node with `q-if` attribute: show content if variable is true
    -   Node with `q-loop` attribute: loop over the contents of a variable
        -   Each pass creates a new stack frame
    -   Any other node: copy to output

<%- include('/inc/code.html', {file: 'expander.js'}) %>

## What does this look like when we put it all together?

-   Full program loads variable definitions from a JSON file
    -   Concatenates strings repeatedly
    -   Look at more efficient approaches in the exercises

<%- include('/inc/code.html', {file: 'template.js'}) %>

## How can we test this?

-   Create a few tests
-   Variable definitions shared by all tests

<%- include('/inc/code.html', {file: 'vars.json'}) %>

-   Static text should be copied over

<%- include('/inc/html.html', {file: 'input-static-text.html'}) %>

<%- include('/inc/code.html', {file: 'static-text.sh'}) %>

<%- include('/inc/html.html', {file: 'output-static-text.html'}) %>

-   Single constant should be substituted

<%- include('/inc/html.html', {file: 'input-single-constant.html'}) %>
<%- include('/inc/html.html', {file: 'output-single-constant.html'}) %>

-   Single variable should be substituted

<%- include('/inc/html.html', {file: 'input-single-variable.html'}) %>
<%- include('/inc/html.html', {file: 'output-single-variable.html'}) %>

-   Expand multiple variables

<%- include('/inc/html.html', {file: 'input-multiple-variables.html'}) %>
<%- include('/inc/html.html', {file: 'output-multiple-variables.html'}) %>

-   Conditional expression

<%- include('/inc/html.html', {file: 'input-conditional.html'}) %>
<%- include('/inc/html.html', {file: 'output-conditional.html'}) %>

-   Loop

<%- include('/inc/html.html', {file: 'input-loop.html'}) %>
<%- include('/inc/html.html', {file: 'output-loop.html'}) %>
