---
---

-   Programs in <g key="compiled_language">compiled languages</g> like C and Java have to be built before they can be run
    -   Translate each module into machine instructions
    -   <g key="link">Link</g> those modules to each other and to libraries
-   If a source file hasn't changed, no need to recompile it before linking
    -   Unless the interface of something it depends on has changed
-   A <g key="build_manager">build manager</g>:
    -   Takes a description of what depends on what
    -   Figures out what is out of date
    -   Figures out an order in which to rebuild things
    -   Does what's necessary
-   Not needed for programs in <g key="interpreted_language">interpreted languages</g>
    -   But still very useful for managing complex workflows
    -   Like building this book's website and PDF
-   Based on [Make][gnu-make], [Bajel][bajel], [Jake][jake], and <cite>Smith2011</cite>

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
    -   Build everything that depends on them in <g key="topological_order">topological order</g>

## Where should we start?

-   Going to experiment with several of these so write a simple <g key="driver">driver</g>
    -   Load a file
    -   Create an instance of whatever class that file exports
    -   Run that instance with the rest of the command-line parameters

<%- include('/_inc/file.html', {file: 'driver.js'}) %>

-   Build files will look like this

<%- include('/_inc/file.html', {file: 'three-simple-rules.yml'}) %>

-   Our classes must have:
    -   A constructor that takes a configuration file as an argument
    -   A `build` method
-   The `build` method
    -   Creates a graph from the configuration file
    -   Checks that there are no cycles
    -   Runs whatever commands are needed to update everything
-   A very simple example of the <g key="template_method_pattern">Template Method</g> pattern
    -   Parent class defines the order of the steps
    -   Child class fills them in

<%- include('/_inc/file.html', {file: 'skeleton-builder.js'}) %>

-   Would normally implement all required methods at once
    -   For tutorial purposes, do them one at a time to make code evolution more readable
-   Load the configuration file during construction

<%- include('/_inc/file.html', {file: 'config-loader.js'}) %>

-   Turn the configuration into a graph
    -   Use [graphlib][graphlib] to manage nodes and links rather than writing our own
    -   Each node stores the recipe to rebuild it
    -   Links go *from* the dependency *to* the target
    -   `setEdge` automatically adds a node if it isn't already present
-   Might as well add the cycle checking here as well

<%- include('/_inc/file.html', {file: 'graph-creator.js'}) %>

-   Again, would have implemented all of these required methods in one step in a real program
-   Can now create something that displays our configuration when it runs but does nothing else

<%- include('/_inc/file.html', {file: 'display-only.js'}) %>

-   Try running it
    -   Takes a moment to read the output with its v's and w's

<%- include('/_inc/multi.html', {pat: 'display-only.*', fill: 'sh out'}) %>

-   Check that we are detecting cycles

<%- include('/_inc/file.html', {file: 'circular-rules.yml'}) %>
<%- include('/_inc/multi.html', {pat: 'check-cycles.*', fill: 'sh out'}) %>

## How can we specify that a file is out of date?

-   Classic approach is to compare timestamps
-   For testing, use another configuration file to specify fake timestamps to nodes

<%- include('/_inc/file.html', {file: 'add-timestamps.yml'}) %>

-   Where to add the timestamps?
    -   Need the graph so that we can decorate it
    -   So add a step to `buildGraph`

<%- include('/_inc/file.html', {file: 'add-timestamps.js'}) %>

-   The steps defined in `SkeletonBuilder.build` don't change
    -   So people reading the code don't have to change their mental model of what it does overall
    -   If someone ever wants to inject a new step between building the graph and adding timestamps,
        they can override `addTimestamps` and put their step at the top before calling `super.addTimestamps`
    -   This *would* make the code a lot harder to read
-   Execution

<%- include('/_inc/multi.html', {pat: 'add-timestamps.*', fill: 'sh out'}) %>

-   Set current time to maximum file time
-   For each file from the "bottom" to the top:
    -   If file is older than any of its dependencies, update it

## How can we update out-of-date files?

-   "Current time" must be later than any of the file update times
    -   Not guaranteed to be true in a networked world where computers' clocks can fall out of sync, but we'll pretend
-   Look at files in topological order from oldest to youngest
    -   If any file is older than the things it depends on, update it
-   Pretend for now that updating takes one unit of time, so we advance our fictional clock once for each build

<%- include('/_inc/multi.html', {pat: 'update-timestamps.*', fill: 'js sh out'}) %>

## How can we add generic build rules?

-   We now want to add <g key="build_rule">build rules</g>
    -   "Build all things in this set the same way"
-   Need:
    -   A way to define a set of files
    -   A way to specify a generic rule
    -   A way to fill in parts of that rule
-   Override `buildGraph` to replace variables in recipes with values
    -   Object-oriented programming helps us change only what we need to change
    -   Depends on a good initial division into overridable chunks
-   Make provides <g key="automatic_variable">automatic variables</g> with names like `$<` and `$@`
-   Ours will be more readable
    -   `@TARGET` for the target
    -   `@DEPENDENCIES` for all dependencies (in order)
    -   `@DEP[1]`, `@DEP[2]`, etc., for specific dependencies
        -   Count from 1 like humans do
-   Test that it still handle rules *without* variables correctly

<%- include('/_inc/multi.html', {pat: 'variable-expander.*', fill: 'js out'}) %>

-   Now we need <g key="pattern_rule">pattern rules</g>
-   First attempt at rules file looks like this

<%- include('/_inc/file.html', {file: 'pattern-rules.yml'}) %>

-   First attempt at reading it extracts rules before expanding variables
    -   But it doesn't work
    -   Didn't actually have the assertion in `add-timestamps.js` when we first wrote it
    -   Added it once we had and traced this error because every failure should turn into an `assert`

<%- include('/_inc/multi.html', {pat: 'pattern-user-attempt.*', fill: 'js out'}) %>

-   Our simple graph loader creates nodes for dependencies even if they aren't targets
-   So we wind up tripping over the lack of a node for `%.in` before we get to extracting rules
-   Rewrite the rule loader to separate pattern rules from simple rules
    -   Check that simple rules' dependencies don't include `%`
    -   And add timestamps as an optional field to rules for testing purposes rather than having them in a separate file

<%- include('/_inc/file.html', {file: 'pattern-user-read.js'}) %>

-   Before we trying running this, let's add methods to show the state of the internal data structures
    -   Since we now have two of them

<%- include('/_inc/multi.html', {pat: 'pattern-user-show.*', fill: 'js sh out'}) %>

-   That seems to be right
-   So let's try expanding rules
    -   Do it after building the graph and rules, but before expanding variables

<%- include('/_inc/multi.html', {pat: 'pattern-user-run.*', fill: 'js out'}) %>

-   We have added a lot of steps to our original template method
    -   Which makes it a bit of a stretch to claim that the overall operation hasn't changed
-   Knowing what we know now, we could go back and modify the original `SkeletonBuilder.build` method
    to include those extra steps and provide do-nothing implementations
    -   After enough examples, the template settles down
    -   We learn from our code as we write it
