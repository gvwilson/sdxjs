---
---

-   Goal: expand HTML templates to create web pages.
    -   Option 1: put JavaScript directly in the page like [EJS][ejs]
    -   Option 2: use directives in `{% raw %}{{…}}{% endraw %}` like [Jekyll][jekyll]
    -   Option 3: use specially-named attributes in HTML
-   We'll use Option 3 because it saves us writing a parser, and because it's unusual
-   Design:
    -   Walk the [DOM][dom] to find nodes with special attributes
    -   "Execute" the instructions in those nodes to generate text
    -   Save other text as-is

-   What will a templated page look like?

{% include file.md file="inputs/loop.html" %}

## How can we transform templates? {#transform-templates}

-   How will we transform it?
    -   Take a template, an output stream, and some variables (e.g., from [YAML][yaml] header)
    -   Pass values in as an object

{% include file.md file="example-call.js" %}

-   What will it generate?

{% include file.md file="outputs/loop.html" %}

## How can we keep track of values? {#values}

-   Need a way to keep track of variables' values
-   Maintain a stack of lookup tables
    -   Each [stack frame][stack-frame] is an object
    -   `Env.find` looks up the list of stack frames
    -   This is [dynamic scoping][dynamic-scoping] not [lexical scoping][lexical-scoping]

{% include file.md file="env.js" %}

-   Structure is defined by our HTML parser
-   Handle nodes with and without children using the [Visitor pattern][visitor-pattern]
    -   `Visitor.walk()` without an argument assigns `undefined` to `node`, so we re-set to the root of the tree
    -   Alternative designs would be build-and-run or pass in the root with every call

{% include file.md file="visitor.js" %}

## How do we handle each type of node? {#node-handling}

-   What do we do with each node?
    -   Text: copy to output
    -   Node with `q-num` attribute: constant
    -   Node with `q-var` attribute: look up variable and output its value
    -   Node with `q-if` attribute: show content if variable is true
    -   Node with `q-loop` attribute: loop over the contents of a variable
        -   Each pass creates a new stack frame
    -   Any other node: copy to output

{% include file.md file="expander.js" %}

## What does this look like when we put it all together? {#integration}

-   Full program loads variable definitions from a JSON file
    -   Concatenates strings repeatedly
    -   Look at more efficient approaches in the exercises

{% include file.md file="template.js" %}

## How can we test this? {#testing}

-   Create a few tests
-   Variable definitions shared by all tests

{% include file.md file="inputs/vars.json" %}

-   Static text should be copied over

{% include file.md file="inputs/static-text.html" %}

{% include file.md file="static-text.sh" %}

{% include file.md file="outputs/static-text.html" %}

-   Single constant should be substituted

{% include wildcard.md pattern="*/single-constant.html" values="inputs, outputs" %}

-   Single variable should be substituted

{% include wildcard.md pattern="*/single-variable.html" values="inputs, outputs" %}

-   Expand multiple variables

{% include wildcard.md pattern="*/multiple-variables.html" values="inputs, outputs" %}

-   Conditional expression

{% include wildcard.md pattern="*/conditional.html" values="inputs, outputs" %}

-   Loop

{% include wildcard.md pattern="*/loop.html" values="inputs, outputs" %}

{% include links.md %}
