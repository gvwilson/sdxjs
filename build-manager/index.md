---
---

Suppose we are using a page templating system to create a website (<span x="page-templates"></span>).
If we a change a single page our tool should translate it,
but shouldn't waste time translating others.
If we change a template,
on the other hand,
the tool should realize that every page in the site is potentially affected
and automatically re-translate all of them.

Choosing what actions to take based on how files depend on one another is a common pattern.
For example,
programs in <span g="compiled_language">compiled languages</span> like C and Java
have to be translated into lower-level forms before they can run.
In fact,
there are usually two stages to the translation:
compiling each source file into some intermediate form,
and then <span g="link">linking</span> the compiled modules to each other and to libraries
to create a runnable program
(<span f="build-manager-compiling"></span>).
If a source file hasn't changed,
there's no need to recompile it before linking.

{% include figure id='build-manager-compiling' img='figures/compiling.svg' alt='Compiling and linking' cap='Compiling source files and linking the resulting modules.' %}

A <span g="build_manager">build manager</span> takes a description of what depends on what,
figures out which files are out of date,
determines an order in which to rebuild things,
and then executes any necessary steps.
Originally created to manage compilation,
they are also useful for programs written in <span g="interpreted_language">interpreted languages</span> like JavaScript
when we want to bundle multiple modules into a single loadable file (<span x="module-bundler"></span>)
or re-create documentation from source code (<span x="doc-generator"></span>).
In this chapter we will create a simple build manager
based on [Make][gnu-make], [Bajel][bajel], [Jake][jake],
and other systems discussed in <cite>Smith2011</cite>.

## What's in a build manager?

The input to a build manager is a set of rules,
each of which has:

-   a <span g="build_target">target</span>, which is the file to be updated;

-   some <span g="dependency">dependencies</span>, which are the things that file depends on;
    and

-   a <span g="build_recipe">recipe</span> that specifies how to update the target
    if it is out of date compared to its dependencies.

The target of one rule can be a dependency of another rule,
so the relationships between the files form a <span g="dag">directed acyclic graph</span> or DAG
(<span f="build-manager-dependencies"></span>).
The graph is directed because "A depends on B" is a one-way relationship;
it cannot contain cycles (or loops) because
if something depends on itself we can never finish updating it.
We say that a target is <span g="build_stale">stale</span> if it is older than any of its dependencies.
When this happens,
we use the recipes to bring it up to date.

{% include figure id='build-manager-dependencies' img='figures/dependencies.svg' alt='Respecting dependencies' cap='How a build manager finds and respects dependencies.' %}

Our build manager must:

1.  Read a file containing rules.

1.  Construct the dependency graph.

1.  Figure out which targets are stale.

1.  Build those targets,
    making sure to build things *before* anything that depends on them is built.

<div class="callout" markdown="1">

### Topological order

A <span g="topological_order">topological ordering</span> of a graph
arranges the nodes so that every node comes after everything it depends on.
For example,
if A depends on both B and C,
then (B, C, A) and (C, B, A) are both valid topological orders of the graph.

</div>

## Where should we start?

We will store our rules in YAML files like this:

{% include file file='three-simple-rules.yml' %}

{: .continue}
We could equally well have used JSON,
but it wouldn't have made sense to use CSV:
rules have a nested structure,
and CSV doesn't represent nesting particularly gracefully.

We are going to create our build manager in stages,
so we start by writing a simple <span g="driver">driver</span> that loads a JavaScript source file,
creates an object of whatever class that file exports,
and runs the `.build` method of that object with the rest of the command-line parameters:

{% include file file='driver.js' %}

{: .continue}
We use the `import` function to dynamically load files containing in <span x="unit-test"></span> as well.
It only saves us a few lines of code in this case,
but we will use this idea of a general-purpose driver for larger programs in future chapters.

To work with our driver,
each version of our build manager must be a class that satistifes two requirements:

1.  Its constructor must take a configuration file as an argument.

1.  It must provide a `build` method that needs no arguments.

The `build` method must create a graph from the configuration file,
check that it does not contain any <span g="cycle">cycles</span>,
and then run whatever commands are needed to update stale targets.
Just as we built a generic `Visitor` class in <span x="page-templates"></span>,
we can build a generic base class for our build manager that does these steps in this order
without actually implementing any of them:

{% include file file='skeleton-builder.js' %}

This is an example of the <span g="template_method_pattern">Template Method</span> design pattern:
the parent class defines the order of the steps
and child classes fill them in
(<span f="build-manager-template-method"></span>).
This design pattern ensures that every child does the same things in the same order,
even if the details of *how* vary from case to case.

{% include figure id='build-manager-template-method' img='figures/template-method.svg' alt='Template Method pattern' cap='The Template Method pattern in action.' %}

We would normally implement all of the methods required by the `build` method at the same time,
but to make the evolving code easier to follow we will write them them one by one.
The `loadConfig` method loads the configuration file
as the builder object is being constructed:

{% include file file='config-loader.js' %}

{: .continue}
The first line does the loading;
the rest of the method checks that the rules are at least superficially plausible.
We need these checks because YAML is a generic file format
that doesn't know anything about the extra requirements of our rules.
And as we first saw in <span x="async-programming"></span>,
we have to specify that the character encoding of our file is UTF-8
so that JavaScript knows how to convert bytes into text.

The next step is to turn the configuration into a graph in memory.
We use the [`graphlib`][graphlib] module to manage nodes and links
rather than writing our own classes for graphs,
and store the recipe to rebuild a node in that node.
Two features of `graphlib` that took us a while to figure out are that:

1.  links go *from* the dependency *to* the target,
    and

1.  `setEdge` automatically adds nodes if they aren't already present.

`graphlib` provides implementations of some common graph algorithms,
including one to check for cycles,
so we might as well write that method at this point as well:

{% include file file='graph-creator.js' %}

We can now create something that displays our configuration when it runs
but does nothing else:

{% include file file='display-only.js' %}

If we run this with our three simple rules as input,
it shows the graph with `v` and `w` keys to represent the ends of the links:

{% include multi pat='display-only.*' fill='sh out' %}

Let's write a quick test to make sure the cycle detector works as intended:

{% include file file='circular-rules.yml' %}
{% include multi pat='check-cycles.*' fill='sh out' %}

## How can we specify that a file is out of date?

The next step is to figure out which files are out of date.
Make does this by comparing the timestamps of the files in question,
but this isn't always reliable:
computers' clocks may be slightly out of sync,
which can produce a wrong answer on a networked filesystem,
and the operating system may only report file update times to the nearest millisecond
(which seemed very short in 1970 but seems very long today).

More modern build systems store a hash of each file's contents
and compare the current hash to the stored one to see if the file has changed.
Since we already looked at hashing in <span x="file-backup"></span>,
we will use the timestamp approach here.
And instead of using a mock filesystem as we did in <span x="file-backup"></span>,
we will simply load another configuration file that specifies fake timestamps for files:

{% include file file='add-timestamps.yml' %}

Since we want to associate those timestamps with files,
we add a step to `buildGraph` to read the timestamp file and add information to the graph's nodes:

{% include file file='add-timestamps.js' %}

<div class="callout" markdown="1">

### Not quite what we were expecting

The steps defined in `SkeletonBuilder.build` don't change when we do this,
so people reading the code don't have to change their mental model of what it does overall.
However,
if we had realized in advance that we were going to want to add timestamps from a file,
we would probably have added a step for that in the template method.
And if someone ever wants to inject a new step between building the graph and adding timestamps,
they will have to override `addTimestamps` and put their step at the top before calling `super.addTimestamps`,
which will make the code a lot harder to understand.
We will reflect on this in the last section of this chapter.

</div>

Before we move on,
let's make sure that adding timestamps works as we want:

{% include multi pat='add-timestamps.*' fill='sh out' %}

## How can we update out-of-date files?

To figure out which recipes to execute and in which order,
we set the pretended current time to the latest time of any file,
then look at each file in topological order.
If a file is older than any of its dependencies,
we update the file *and* its pretended timestamp
to trigger an update of anything that depends on it.

We can pretend that updating a file always takes one unit of time,
so we advance our fictional clock by one for each build.
Using `graphlib.alg.topsort` to create the topological order,
we get this:

{% include file file='update-timestamps.js' %}

The `run` method:

1.  Gets a sorted list of nodes.

1.  Sets the starting time to be one unit past the largest file time.

1.  Uses `Array.reduce` to operate on each node (i.e., each file) in order.
    If that file is stale,
    we print the steps we would run and then update the file's timestamp.
    We only advance the notional current time when we do an update.

In order to check if a file is stale,
we see if any of its dependencies currently have timestamps greater than or equal to its.
When we run this,
it seems to do the right thing:

{% include multi pat='update-timestamps.*' fill='sh out' %}

## How can we add generic build rules?

If our website has a hundred blog posts
or a hundred pages of documentation about particular JavaScript files,
we don't want to have to write a hundred nearly-identical recipes.
Instead,
we want to be able to write generic <span g="build_rule">build rules</span> that say,
"Build all things of this kind the same way."
These generic rules need:

-   a way to define a set of files;

-   a way to specify a generic rule;
    and

-   a way to fill in parts of that rule.

We will achieve this by overriding `buildGraph` to replace variables in recipes with values.
Once again,
object-oriented programming helps us change only what we need to change,
provided we divided our problem into sensible chunks in the first place.

Make provides <span g="automatic_variable">automatic variables</span> with names like `$<` and `$@`
to represent the parts of a rule.
Our variables will be more readable:
we will use `@TARGET` for the target,
`@DEPENDENCIES` for the dependencies (in order),
and `@DEP[1]`, `@DEP[2]`, and so on for specific dependencies
(<span f="build-manager-pattern-rules"></span>).

{% include figure id='build-manager-pattern-rules' img='figures/pattern-rules.svg' alt='Pattern rules' cap='Turning patterns rules into runnable commands.' %}

Our variable expander looks like this:

{% include file file='variable-expander.js' %}

The first thing we do is test that it works when there *aren't* any variables to expand
by running it on the same example we used previously:

{% include file file='variable-expander.out' %}

{: .continue}
This is perhaps the most important reason to create tests:
they tell us right away if something we have added or changed
has broken something that used to work.
That gives us a firm base to build on as we debug the new code.

Now we need to add <span g="pattern_rule">pattern rules</span>.
Our first attempt at a rules file looks like this:

{% include file file='pattern-rules.yml' %}

{: .continue}
and our first attempt at reading it extracts rules before expanding variables:

{% include file file='pattern-user-attempt.js' %}

However,
that doesn't work:

{% include file file='pattern-user-attempt.out' %}

{: .continue}
The problem is that our simple graph loader creates nodes for dependencies even if they aren't targets.
As a result,
we wind up tripping over the lack of a node for `%.in` before we get to extracting rules.

<div class="callout" markdown="1">

### Errors become assertions

When we first wrote `add-timestamps.js`,
it didn't contain the assertion
that printed the error message shown above.
Once we tracked down our bug,
though,
we added the assertion to ensure we didn't make the same mistake again,
and as <span g="runnable_documentation">runnable documentation</span>
to tell the next programmer more about the code.
Regular code tells the computer what to do;
assertions with meaningful error messages tell the reader why.

</div>

We can fix our problem by rewriting the rule loader
to separate pattern rules from simple rules;
we can tell the two apart by checking if the rule's dependencies include `%`.
While we're here,
we will enable timestamps as an optional field in the rules for testing purposes
rather than having them in a separate file:

{% include file file='pattern-user-read.js' %}

Before we try to run this,
let's add methods to show the state of our two internal data structures:

{% include multi pat='pattern-user-show.*' fill='js sh out' %}

The output seems to be right,
so let's try expanding rules *after* building the graph and rules
but *before* expanding variables:

{% include multi pat='pattern-user-run.*' fill='js out' %}

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
and if we know enough to anticipate 100% of the issues that are going to come up,
it's time to put what we've learned in a library for future use.
