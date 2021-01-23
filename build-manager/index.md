---
---

Suppose we are using a page templating system to create a website
and make a change to a single page.
Our tool should translate that page, but shouldn't waste time translating others.
If we change one of our template,
on the other hand,
the tool should realize that every page in the site is potentially affected
and should automatically re-translate all of them.

Taking actions based on dependencies between files
comes up in many other situations.
For example,
programs in <g key="compiled_language">compiled languages</g> like C and Java
have to be translated explicitly before they can be run.
In fact,
there are usually two stages to the translation:
compiling each source file into some intermediate form,
and then <g key="link">linking</g> the compiled modules to each other and to libraries
to create a runnable program
(<f key="build-manager-compiling"></f>).
If a source file hasn't changed,
there's no need to recompile it before linking
unless the interface of something it depends on has changed.

<%- include('/inc/figure.html', {
    id: 'build-manager-compiling',
    img: './figures/compiling.svg',
    alt: 'Compiling and linking',
    cap: 'Compiling source files and linking the resulting modules.'
}) %>

A <g key="build_manager">build manager</g> is a tool that
takes a description of what depends on what,
figures out what is out of date,
figures out an order in which to rebuild things,
and then executes any necessary steps.
They are useful even for programs written in <g key="interpreted_language">interpreted languages</g> like JavaScript
if we want to bundle multiple files into a single loadable module (<x key="module-bundler"></x>)
or re-create documentation from source code (<x key="doc-generator"></x>).
In this chapter we will create a simple build manager
based on [Make][gnu-make], [Bajel][bajel], [Jake][jake], and <cite>Smith2011</cite>.

## What's in a build manager?

The input to a build manager is a set of rules,
each of which has:

-   a <g key="build_target">target</g>, which is the file to be updated;

-   some <g key="dependency">dependencies</g>, which are the things that file depends on; and

-   a <g key="build_recipe">recipe</g> that specifies how to update the target
    if it is out of date compared to its dependencies.

The target of one rule can be a dependency of another rule,
so the relationships between the files form a <g key="dag">directed acyclic graph</g> or DAG
(<f key="build-manager-dependencies"></f>).
The graph is directed because "A depends on B" is a one-way relationship;
it has to be acyclic because if something depends on itself we cannot ever finish updating it.
We say that a target is <g key="build_stale">stale</g> if it is older than any of its dependencies.
When this happens,
we use the recipes to bring it up to date.

<%- include('/inc/figure.html', {
    id: 'build-manager-dependencies',
    img: './figures/dependencies.svg',
    alt: 'Respecting dependencies',
    cap: 'How a build manager finds and respects dependencies.'
}) %>

Our build manager will do four things:

1.  Read a file containing rules.

2.  Construct the dependency graph.

3.  Figure out which targets are stale.

4.  Build those targets in <g key="topological_order">topological order</g>,
    i.e.,
    make sure things are built *before* things that depend on them are built.

## Where should we start?

Our rules will be stored in YAML files like this:

<%- include('/inc/file.html', {file: 'three-simple-rules.yml'}) %>

::: continue
We could equally well have used JSON,
but it wouldn't have made sense to use CSV:
rules have a nested structure,
and CSV doesn't handle that particularly gracefully.
:::

We are going to create our build manager in stages,
so we start by writing a simple <g key="driver">driver</g> that loads a JavaScript source file,
creates an instance of whatever class that file exports,
and runs that instance with the rest of the command-line parameters:

<%- include('/inc/file.html', {file: 'driver.js'}) %>

::: continue
This only saves us a few lines of code in this case,
but we will use this idea for larger programs in future chapters.
:::

Looking at the driver,
each version of our build manager must be a class
whose constructor takes a configuration file as an argument
and that provides a `build` method.
That method must create a graph from the configuration file,
check that it does not contain any <g key="cycle">cycles</g>,
and then run whatever commands are needed to update stale targets.
Just as we built a generic `Visitor` class in <x key="page-templates"></x>,
we can build a generic base class for our build manager that does these steps in this order
without actually implementing any of them:

<%- include('/inc/file.html', {file: 'skeleton-builder.js'}) %>

This is a simple example of the <g key="template_method_pattern">Template Method</g> pattern
(<f key="build-manager-template-method"></f>):
the parent class defines the order of the steps,
while child classes fill them in.
This pattern ensures that every child conceptually does the same things in the same order,
even if the details vary.

<%- include('/inc/figure.html', {
    id: 'build-manager-template-method',
    img: './figures/template-method.svg',
    alt: 'Template Method pattern',
    cap: 'The Template Method pattern in action.'
}) %>

We would normally implement all of the methods required by the parent class's template method at the same time.
For tutorial purposes,
we will write them them one by one to make the evolving code more readable.
The first method we implement loads the configuration file during construction:

<%- include('/inc/file.html', {file: 'config-loader.js'}) %>

::: continue
The first line does the loading;
the rest of the method checks that the rules are at least superficially plausible.
We need these checks because YAML is a generic file format
that doesn't know anything about the extra requirements of our rules.
:::

The next step is to turn the configuration into a graph in memory.
We use [`graphlib`][graphlib] to manage nodes and links rather than writing our own classes for graphs,
and store the recipe to rebuild a node in that node.
Two features of [`graphlib`][graphlib] that took us a while to figure out are:

1.  links go *from* the dependency *to* the target, and

2.  `setEdge` automatically adds nodes if they aren't already present.

[`graphlib`][graphlib] provides implementations of some common graph algorithms,
including one to check for cycles,
so we decided to write that method at this point as well:

<%- include('/inc/file.html', {file: 'graph-creator.js'}) %>

We can now create something that displays our configuration when it runs
but does nothing else:

<%- include('/inc/file.html', {file: 'display-only.js'}) %>

If we run this with our three simple rules as input,
it shows the graph with `v` and `w` keys to represent the ends of the links:

<%- include('/inc/multi.html', {pat: 'display-only.*', fill: 'sh out'}) %>

Let's write a quick test to make sure our cycle detector actually works:

<%- include('/inc/file.html', {file: 'circular-rules.yml'}) %>
<%- include('/inc/multi.html', {pat: 'check-cycles.*', fill: 'sh out'}) %>

## How can we specify that a file is out of date?

The next step is to figure out which files are out of date.
[Make][gnu-make] did this by comparing the timestamps on the files in question,
but this isn't always reliable across networks
(because computers' clocks may be very slightly out of sync)
and because the operating system may only report file update times to the nearest millisecond,
which seemed like a very short time in 1970 but seems very long today.
More modern systems store a hash of each file's contents
and compare the current hash to the stored one to see if the file has changed.

Since we already looked at hashing in <x key="file-backup"></x>,
we will use the timestamp approach in our design.
For testing,
we will use another configuration file to specify fake timestamps for files:

<%- include('/inc/file.html', {file: 'add-timestamps.yml'}) %>

Since we want to associate those timestamps with files,
we add a step to `buildGraph` to read the timestamp file and add information to the graph's nodes:

<%- include('/inc/file.html', {file: 'add-timestamps.js'}) %>

The steps defined in `SkeletonBuilder.build` don't change when we do this,
so people reading the code don't have to change their mental model of what it does overall.
However,
if we had realized in advance that we were going to want to add timestamps from a file,
we would probably have added a step for that in the template method.
And if someone ever wants to inject a new step between building the graph and adding timestamps,
they will have to override `addTimestamps` and put their step at the top before calling `super.addTimestamps`,
which will make the code a lot harder to understand.
We will reflect on this in the last section of this chapter.

Before we move on,
let's make sure that adding timestamps works as we want:

<%- include('/inc/multi.html', {pat: 'add-timestamps.*', fill: 'sh out'}) %>

## How can we update out-of-date files?

To figure out which recipes to execute and in which order,
we set the pretended "current time" to the latest time of any file,
then look at each file from the "bottom" to the "top" in topological order.
If a file is older than any of its dependencies,
we update the file *and* its pretended timestamp
to trigger an update of anything that depends on it.

We will pretend for now that updating a file takes one unit of time,
so we advance our fictional clock once for each build.
Using `graphlib.alg.topsort` to create the topological order,
we get this:

<%- include('/inc/file.html', {file: 'update-timestamps.js'}) %>

The `run` method:

1.  Gets a sorted list of nodes.

2.  Sets the starting time to be one unit past the largest file time.

3.  Uses `Array.reduce` to operate on each node (i.e., each file) in order.
    If that file is stale,
    we print the steps we would run and then update the file's timestamp.
    We only advance the notional current time when we do an update.

In order to check if a file is stale,
we see if any of its dependencies currently have timestamps greater than or equal to its.
When we run this,
it seems to do the right thing:

<%- include('/inc/multi.html', {pat: 'update-timestamps.*', fill: 'sh out'}) %>

## How can we add generic build rules?

If our website has a hundred blog posts or a hundred pages of documentation about particular JavaScript files,
we don't want to have to write a hundred nearly-identical recipes.
Instead,
we want to be able to write generic <g key="build_rule">build rules</g> that say,
"Build all things in this set the same way."
To do this,
we need:

-   a way to define a set of files;

-   a way to specify a generic rule; and

-   a way to fill in parts of that rule.

We will achieve this by overriding `buildGraph` to replace variables in recipes with values.
Once again,
object-oriented programming helps us change only what we need to change,
provided we divided our problem into sensible chunks in the first place.

[Make][gnu-make] provides <g key="automatic_variable">automatic variables</g> with names like `$<` and `$@`
to represent the parts of a rule.
Our variables will be more readable:
we will use `@TARGET` for the target,
`@DEPENDENCIES` for the dependencies (in order),
and `@DEP[1]`, `@DEP[2]`, and so on for specific dependencies
(<f key="build-manager-pattern-rules"></f>).

<%- include('/inc/figure.html', {
    id: 'build-manager-pattern-rules',
    img: './figures/pattern-rules.svg',
    alt: 'Pattern rules',
    cap: 'Turning patterns rules into runnable commands.'
}) %>

Our variable expander looks like this:

<%- include('/inc/file.html', {file: 'variable-expander.js'}) %>

::: continue
and the first thing we do is test that it works when there *aren't* any variables to expand
by running it on the same example we used previously:
:::

<%- include('/inc/file.html', {file: 'variable-expander.out'}) %>

Now we need to add <g key="pattern_rule">pattern rules</g>.
Our first attempt at a rules file looks like this:

<%- include('/inc/file.html', {file: 'pattern-rules.yml'}) %>

::: continue
and our first attempt at reading it extracts rules before expanding variables:
:::

<%- include('/inc/file.html', {file: 'pattern-user-attempt.js'}) %>

However,
that doesn't work:

<%- include('/inc/file.html', {file: 'pattern-user-attempt.out'}) %>

::: continue
The problem is that our simple graph loader creates nodes for dependencies even if they aren't targets.
As a result,
we wind up tripping over the lack of a node for `%.in` before we get to extracting rules.
:::

::: callout
### Errors become assertions

We didn't have the assertion in `add-timestamps.js` that printed the error message shown above when we first wrote it.
Once we tracked down our bug,
though,
we added the assertion to ensure we didn't make the same mistake again,
and as <g key="runnable_documentation">runnable documentation</g>
to tell the next programmer more about the code.
Regular code tells the computer what to do;
assertions tell the reader why it's doing it.
:::

We can fix our problem by rewriting the rule loader
to separate pattern rules from simple rules;
we can tell the two apart by checking if the rule's dependencies include `%`.
While we're here,
we will timestamps as an optional field in the rules for testing purposes
rather than having them in a separate file:

<%- include('/inc/file.html', {file: 'pattern-user-read.js'}) %>

Before we try to run this,
let's add methods to show the state of our two internal data structures:

<%- include('/inc/multi.html', {pat: 'pattern-user-show.*', fill: 'js sh out'}) %>

The output seems to be right,
so let's try expanding rules *after* building the graph and rules
but *before* expanding variables:

<%- include('/inc/multi.html', {pat: 'pattern-user-run.*', fill: 'js out'}) %>

## What should we do next?

We have added a lot of steps to our original template method,
which makes it a bit of a stretch to claim that the overall operation hasn't changed.
Knowing what we know now,
we could go back and modify the original `SkeletonBuilder.build` method
to include those extra steps and provide do-nothing implementations.

The root of the problem is that we didn't anticipate all the steps that would be involved
when we wrote our template method.
It typically takes a few child classes for this to settle down;
if it never does,
then Template Method is probably the wrong pattern for our situation.
Realizing this isn't a failure in initial design:
we always learn about our problem as we try to capture it in code,
and if we can anticipate 100% of the issues that are going to come up,
it's time to put what we've learned in a library for future use.
