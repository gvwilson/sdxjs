---
---

-   Rebuild files that depend on other files
    -   Based on [Make][gnu-make] and [Bajel][bajel]
    -   Draws on <cite>Smith2011</cite>

## What's in a build manager?

-   Every rule has:
    -   A <g key="build_target">target</g>
    -   <g key="dependency">Dependencies</g>
    -   <g key="build_recipe">Recipes</g>
-   Forms a <g key="dag">directed acyclic graph</g> (DAG)
    -   Acyclic because if something depends on itself we can't ever finish updating it
-   A target is <g key="build_stale">stale</g> if it is older than any of its dependencies
    -   Use the recipes to bring it up to date
-   So:
    -   Read configuration
    -   Construct dependency graph
    -   Find out what nodes are stale
    -   Build everything that depends on them
    -   In <g key="topological_order">topological order</g>

## Where should we start?

-   Going to experiment with a lot of these so write a general-purpose driver
    -   A simple example of the <g key="template_method_pattern">Template Method</g> pattern
    -   The `build` method defined in the base class does some things and then calls `run`
    -   The child class *must* define `run` to do its part
-   Driver loads a class, creates an instance, and asks it to build

<%- include('/inc/code.html', {file: 'driver.js'}) %>

-   Class that simple builders must be derived from

<%- include('/inc/code.html', {file: 'simple-builder.js'}) %>

-   Example of derived (runnable) class

<%- include('/inc/code.html', {file: 'display-only.js'}) %>

-   Configuration file

<%- include('/inc/code.html', {file: 'three-simple-rules.yaml'}) %>

-   Execution and output

<%- include('/inc/multi.html', {pat: 'display-only.*', fill: 'sh text'}) %>

## How can we tell if a file is stale?

-   Classic approach is to compare timestamps
-   For testing, take another configuration file and add fake timestamps to nodes
-   Extra file
    -   Clumsy to have the derived class magically know which argument to use

<%- include('/inc/code.html', {file: 'add-timestamps.yaml'}) %>

-   Execution

<%- include('/inc/multi.html', {pat: 'add-timestamps.*', fill: 'js sh text'}) %>

-   Set current time to maximum file time
-   For each file from the "bottom" to the top:
    -   If file is older than any of its dependencies, update it

<%- include('/inc/multi.html', {pat: 'update-on-timestamp.*', fill: 'js sh text'}) %>

## How can we add generic build rules?

-   We now want to add <g key="build_rule">build rules</g>
    -   "Build all things in this set the same way"
-   Need:
    -   A way to define a set of files
    -   A way to specify a generic rule
    -   A way to fill in parts of that rule
-   Override `SimpleBuilder.buildGraph` to replace variables in recipes with values
    -   Object-oriented programming helps us change only what we need to change
    -   Depends on a good initial division into overridable chunks
-   Make provides <g key="automatic_variable">automatic variables</g> with names like `$<` and `$@`
-   Ours will be more readable
    -   `@TARGET` for the target
    -   `@DEPENDENCIES` for all dependencies (in order)
    -   `@DEP[1]`, `@DEP[2]`, etc., for specific dependencies
        -   Count from 1 like humans do
-   Build the recipe through brute force string substitution
    -   Look at more efficient strategies in the exercises

<%- include('/inc/multi.html', {pat: 'variable-expander.*', fill: 'js text'}) %>

-   Now we need <g key="pattern_rule">pattern rules</g>
-   First attempt at rules file looks like this

<%- include('/inc/code.html', {file: 'pattern-rules.yaml'}) %>

-   First attempt at reading it doesn't work

<%- include('/inc/multi.html', {pat: 'pattern-user-attempt.*', fill: 'js sh text'}) %>

-   Our simple graph loader creates nodes for dependencies even if they aren't targets
-   So we wind up tripping over the lack of a node for `%.in` before we get to extracting rules
-   Wind rewrite the rule loader to separate pattern rules from simple rules
    -   Add a method to convert the build graph to JSON for display, since we now have an extra data structure
    -   Check that simple rules' dependencies don't include `%`
    -   And add timestamps as an optional field to rules for testing purposes rather than having them in a separate file

<%- include('/inc/multi.html', {pat: 'pattern-user-read.*', fill: 'js sh text'}) %>

-   Order of operations is important
    -   Load file, separating simple rules from pattern rules
    -   Expand uses of the pattern rules to add more nodes to the graph
    -   Expand variables
    -   Run the completed graph
-   Because we used `run` to print the graph in `simple-user-read.js`, we have to:
    -   Reimplement it here
    -   Call up to a grandparent
-   This tells us that we should refactor our base class(es) to create more <g key="affordance">affordances</g>

<%- include('/inc/multi.html', {pat: 'pattern-user-run.*', fill: 'js text'}) %>
