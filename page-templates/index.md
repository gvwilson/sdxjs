---
---

<%- include('/_inc/glossrefs.html') %>

-   Goal: expand HTML templates to create web pages.
    -   Option 1: put JavaScript directly in the page like [EJS][ejs]
    -   Option 2: use a mini-language like [Jekyll][jekyll]
    -   Option 3: use specially-named attributes in HTML
-   We'll use Option 3 because it saves us writing a parser, and because it's unusual
-   Design:
    -   Walk the <g key="dom">DOM</g> to find nodes with special attributes
    -   "Execute" the instructions in those nodes to generate text
    -   Save other text as-is

## What will our system look like?

-   What will a templated page look like?

<%- include('/_inc/html.html', {file: 'input-loop.html'}) %>

-   Take a template, an output stream, and some variables
    -   E.g., from a <g key="yaml">YAML</g> header in the file
-   Pass the values into the expansion as an object

<%- include('/_inc/file.html', {file: 'example-call.js'}) %>

-   Output will look like HTML without any traces of how it was created

<%- include('/_inc/html.html', {file: 'output-loop.html'}) %>

## How can we keep track of values?

-   Need a way to keep track of variables' values
-   Maintain a stack of lookup tables
    -   Each <g key="stack_frame">stack frame</g> is an object
    -   `Env.find` looks up the list of stack frames
    -   This is <g key="dynamic_scoping">dynamic scoping</g> not <g key="lexical_scoping">lexical scoping</g>
-   Why a stack and not just a single object?
    -   So that variables inside loops don't affect one another

<%- include('/_inc/file.html', {file: 'env.js'}) %>

-   Handle nodes using the <g key="visitor_pattern">Visitor pattern</g>
    -   `Visitor.walk()` gives `node` a default value of `undefined`, which signals that we want to restart
    -   Alternative designs would be build-and-run or pass in the root with every call

<%- include('/_inc/file.html', {file: 'visitor.js'}) %>

## How do we handle each type of node?

-   Text: copy to output
-   Nodes without special attributes: copy to output
-   Or:
    -   Node with `q-num` attribute: constant
    -   Node with `q-var` attribute: look up variable and output its value
    -   Node with `q-if` attribute: show content if variable is true
    -   Node with `q-loop` attribute: loop over the contents of a variable
-   We could put this all in one class
-   Or create a small class to handle each case
    -   The <g key="delegate_pattern">Delegate</g> design pattern
    -   Easier to expand in future
-   Overall structure is straightforward

<%- include('/_inc/erase.html', {file: 'expander.js', tag: 'body'}) %>

-   Methods that do the work

<%- include('/_inc/slice.html', {file: 'expander.js', tag: 'body'}) %>

## What does this look like when we put it all together?

-   Full program loads variable definitions from a JSON file
    -   Put strings in an array and concatenate at the end
    -   More efficient than repeated concatenation

<%- include('/_inc/file.html', {file: 'template.js'}) %>

## How can we test this?

-   Create a few tests
-   Variable definitions shared by all tests

<%- include('/_inc/file.html', {file: 'vars.json'}) %>

-   Static text should be copied over

<%- include('/_inc/html.html', {file: 'input-static-text.html'}) %>
<%- include('/_inc/file.html', {file: 'static-text.sh'}) %>
<%- include('/_inc/html.html', {file: 'output-static-text.html'}) %>
<%- include('/_inc/page.html', {file: 'output-static-text.html'}) %>

-   Single constant should be substituted

<%- include('/_inc/html.html', {file: 'input-single-constant.html'}) %>
<%- include('/_inc/html.html', {file: 'output-single-constant.html'}) %>
<%- include('/_inc/page.html', {file: 'output-single-constant.html'}) %>

-   Single variable should be substituted

<%- include('/_inc/html.html', {file: 'input-single-variable.html'}) %>
<%- include('/_inc/html.html', {file: 'output-single-variable.html'}) %>
<%- include('/_inc/page.html', {file: 'output-single-variable.html'}) %>

-   Expand multiple variables

<%- include('/_inc/html.html', {file: 'input-multiple-variables.html'}) %>
<%- include('/_inc/html.html', {file: 'output-multiple-variables.html'}) %>
<%- include('/_inc/page.html', {file: 'output-multiple-variables.html'}) %>

-   Conditional expression

<%- include('/_inc/html.html', {file: 'input-conditional.html'}) %>
<%- include('/_inc/html.html', {file: 'output-conditional.html'}) %>
<%- include('/_inc/page.html', {file: 'output-conditional.html'}) %>

-   Loop

<%- include('/_inc/html.html', {file: 'input-loop.html'}) %>
<%- include('/_inc/html.html', {file: 'output-loop.html'}) %>
<%- include('/_inc/page.html', {file: 'output-loop.html'}) %>

<%- include('/_inc/problems.html') %>
