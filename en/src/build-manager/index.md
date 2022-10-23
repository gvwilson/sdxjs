 ---
title: "Build Manager"
---

Suppose we are using a page templating system to create a website ([%x page-templates %]).
If we change a single page our tool should translate it,
but shouldn't waste time translating others.
If we change a template,
on the other hand,
the tool should realize that every page in the site is potentially affected
and automatically re-translate all of them.

Choosing what actions to take based on how files depend on one another is a common pattern.
For example,
programs in [%i "compiled language" "language!compiled" %][%g compiled_language "compiled languages" %][%/i%]
like [%i "C" %]C[%/i%] and [%i "Java" %]Java[%/i%]
have to be translated into lower-level forms before they can run.
In fact,
there are usually two stages to the translation:
compiling each source file into some intermediate form,
and then [%i "linking (compiled language)" "compiled language!linking" %][%g link "linking" %][%/i%] the compiled modules
to each other and to libraries
to create a runnable program
([%f build-manager-compiling %]).
If a source file hasn't changed,
there's no need to recompile it before linking.

[% figure
   slug="build-manager-compiling"
   img="compiling.svg"
   alt="Compiling and linking"
   caption="Compiling source files and linking the resulting modules."
%]

A [%i "build manager" %][%g build_manager "build manager" %][%/i%] takes a description of what depends on what,
figures out which files are out of date,
determines an order in which to rebuild things,
and then executes any necessary steps.
Originally created to manage compilation,
they are also useful for programs written in [%i "language!interpreted" "interpreted language" %][%g interpreted_language "interpreted languages" %][%/i%]
like JavaScript
when we want to bundle multiple modules into a single loadable file ([%x module-bundler %])
or re-create documentation from source code ([%x doc-generator %]).
In this chapter we will create a simple build manager
based on [%i "Make" %][Make][gnu_make][%/i%], [%i "Bajel" %][Bajel][bajel][%/i%], [%i "Jake" %][Jake][jake][%/i%],
and other systems discussed in [%b Smith2011 %].

## What's in a build manager? {: #build-manager-contents}

The input to a build manager is a set of rules,
each of which has:

-   a [%i "build target" "target!build" %][%g build_target "target" %][%/i%], which is the file to be updated;

-   some [%i "dependency (in build)" "build!dependency" %][%g dependency "dependencies" %][%/i%], which are the things that file depends on;
    and

-   a [%i "recipe (in build)" "build!recipe" %][%g build_recipe "recipe" %][%/i%] that specifies how to update the target
    if it is out of date compared to its dependencies.

The target of one rule can be a dependency of another rule,
so the relationships between the files form a [%i "directed acyclic graph (DAG)" "DAG" %][%g dag "directed acyclic graph" %][%/i%] or DAG
([%f build-manager-dependencies %]).
The graph is directed because "A depends on B" is a one-way relationship;
it cannot contain cycles (or loops) because
if something depends on itself we can never finish updating it.
We say that a target is [%i "stale (in build)" "build!stale" %][%g build_stale "stale" %][%/i%] if it is older than any of its dependencies.
When this happens,
we use the recipes to bring it up to date.
{: .continue}

[% figure
   slug="build-manager-dependencies"
   img="dependencies.svg"
   alt="Respecting dependencies"
   caption="How a build manager finds and respects dependencies."
%]

Our build manager must:

1.  Read a file containing rules.

1.  Construct the dependency graph.

1.  Figure out which targets are stale.

1.  Build those targets,
    making sure to build things *before* anything that depends on them is built.

<div class="callout" markdown="1">

### Topological order

A [%i "topological order" %][%g topological_order "topological ordering" %][%/i%] of a graph
arranges the nodes so that every node comes after everything it depends on.
For example,
if A depends on both B and C,
then (B, C, A) and (C, B, A) are both valid topological orders of the graph.

</div>

## Where should we start? {: #build-manager-start}

We will store our rules in YAML files like this:

[% inc file="three-simple-rules.yml" %]

We could equally well have used JSON,
but it wouldn't have made sense to use CSV:
rules have a nested structure,
and CSV doesn't represent nesting particularly gracefully.
{: .continue}

We are going to create our build manager in stages,
so we start by writing a simple [%i "software design!driver" %][%g driver "driver" %][%/i%] that loads a JavaScript source file,
creates an object of whatever class that file exports,
and runs the `.build` method of that object with the rest of the command-line parameters:

[% inc file="driver.js" %]

We use the `import` function to dynamically load files in [%x unit-test %] as well.
It only saves us a few lines of code in this case,
but we will use this idea of a general-purpose driver for larger programs in future chapters.
{: .continue}

To work with our driver,
each version of our build manager must be a class that satisfies two requirements:

1.  Its constructor must take a configuration file as an argument.

1.  It must provide a `build` method that needs no arguments.

The `build` method must create a graph from the configuration file,
check that it does not contain any [%g cycle "cycles" %],
and then run whatever commands are needed to update stale targets.
Just as we built a generic [%i "Visitor pattern" "design pattern!Visitor" %]`Visitor`[%/i%] class in [%x page-templates %],
we can build a generic base class for our build manager that does these steps in this order
without actually implementing any of them:
{: .continue}

[% inc file="skeleton-builder.js" %]

This is an example of
the [%i "Template Method pattern" "design pattern!Template Method" %][%g template_method_pattern "Template Method" %][%/i%] design pattern:
the parent class defines the order of the steps
and child classes fill them in
([%f build-manager-template-method %]).
This design pattern ensures that every child does the same things in the same order,
even if the details of *how* vary from case to case.

[% figure
   slug="build-manager-template-method"
   img="template-method.svg"
   alt="Template Method pattern"
   caption="The Template Method pattern in action."
%]

We would normally implement all of the methods required by the `build` method at the same time;
here, we will write them them one-by-one to make the evolving code easier to follow.
The `loadConfig` method loads the configuration file
as the builder object is being constructed:

[% inc file="config-loader.js" %]

The first line does the loading;
the rest of the method checks that the rules are at least superficially plausible.
We need these checks because YAML is a generic file format
that doesn't know anything about the extra requirements of our rules.
And as we first saw in [%x async-programming %],
we have to specify that the character encoding of our file is UTF-8
so that JavaScript knows how to convert bytes into text.
{: .continue}

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
so we might as well write that method at this point as follows:
{: .continue}

[% inc file="graph-creator.js" %]

We can now create something that displays our configuration when it runs
but does nothing else:

[% inc file="display-only.js" %]

If we run this with our three simple rules as input,
it shows the graph with `v` and `w` keys to represent the ends of the links:

[% inc pat="display-only.*" fill="sh out" %]

Let's write a quick test to make sure the cycle detector works as intended:

[% inc file="circular-rules.yml" %]
[% inc pat="check-cycles.*" fill="sh out" %]

## How can we specify that a file is out-of-date? {: #build-manager-timestamp}

The next step is to figure out which files are out-of-date.
Make does this by comparing the [%i "timestamp!in build" "build!timestamp" %]timestamps[%/i%] of the files in question,
but this isn't always reliable:
[%i "clock synchronization (in build)" "build!clock synchronization" %]computers' clocks may be slightly out of sync[%/i%],
which can produce a wrong answer on a networked filesystem,
and the operating system may only report file update times to the nearest millisecond
(which seemed very short in 1970 but seems very long today).

More modern build systems store a [%i "hash code!in build" "build!hash code" %]hash[%/i%] of each file's contents
and compare the current hash to the stored one to see if the file has changed.
Since we already looked at hashing in [%x file-backup %],
we will use the timestamp approach here.
And instead of using a mock filesystem as we did in [%x file-backup %],
we will simply load another configuration file that specifies fake timestamps for files:

[% inc file="add-stamps.yml" %]

Since we want to associate those timestamps with files,
we add a step to `buildGraph` to read the timestamp file and add information to the graph's nodes:

[% inc file="add-stamps.js" %]

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

</div>

Before we move on,
let's make sure that adding timestamps works as we want:

[% inc pat="add-stamps.*" fill="sh out" %]

## How can we update out-of-date files? {: #build-manager-update}

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

[% inc file="update-stamps.js" %]

The `run` method:

1.  gets a sorted list of nodes;

1.  sets the starting time to be one unit past the largest file time;
    and then

1.  uses [%i "Array.reduce" %]`Array.reduce`[%/i%] to operate on each node (i.e., each file) in order.
    If that file is stale,
    we print the steps we would run and then update the file's timestamp.
    We only advance the notional current time when we do an update.

To check if a file is stale,
we see if any of its dependencies currently have timestamps greater than or equal to its own.
When we run this,
it seems to do the right thing:
{: .continue}

[% inc pat="update-stamps.*" fill="sh out" %]

## How can we add generic build rules? {: #build-manager-generic}

If our website has a hundred blog posts
or a hundred pages of documentation about particular JavaScript files,
we don't want to have to write a hundred nearly-identical recipes.
Instead,
we want to be able to write generic [%i "build!rule" "rule (in build)" %][%g build_rule "build rules" %][%/i%] that say,
"Build all things of this kind the same way."
These generic rules need to:

-   a way to define a set of files;

-   a way to specify a generic rule;
    and

-   a way to fill in parts of that rule.

We will achieve this by overriding `buildGraph` to replace variables in recipes with values.
Once again,
object-oriented programming helps us change only what we need to change,
provided we divided our problem into sensible chunks in the first place.
{: .continue}

Make provides [%i "automatic variable (in build)" "build!automatic variable" %][%g automatic_variable "automatic variables" %][%/i%]
with names like `$<` and `$@`
to represent the parts of a rule.
Ours will be more readable:
we will use `@TARGET` for the target,
`@DEPENDENCIES` for the dependencies (in order),
and `@DEP[1]`, `@DEP[2]`, and so on for specific dependencies
([%f build-manager-pattern-rules %]).
Our variable expander looks like this:

[% inc file="variable-expander.js" %]

[% figure
   slug="build-manager-pattern-rules"
   img="pattern-rules.svg"
   alt="Pattern rules"
   caption="Turning patterns rules into runnable commands."
%]

The first thing we do is test that it works when there *aren't* any variables to expand
by running it on the same example we used previously:

[% inc file="variable-expander.out" %]

This is perhaps the most important reason to create tests:
they tell us right away if something we have added or changed
has broken something that used to work.
That gives us a firm base to build on as we debug the new code.
{: .continue}

<div class="pagebreak"></div>
Now we need to add [%i "pattern rule (in build)" "build!pattern rule" %][%g pattern_rule "pattern rules" %][%/i%].
Our first attempt at a rules file looks like this:

[% inc file="pattern-rules.yml" %]

and our first attempt at reading it extracts rules before expanding variables:
{: .continue}

[% inc file="pattern-user-attempt.js" %]

However,
that doesn't work:

[% inc file="pattern-user-attempt.out" %]

The problem is that our simple graph loader creates nodes for dependencies even if they aren't targets.
As a result,
we wind up tripping over the lack of a node for `%.in` before we get to extracting rules.
{: .continue}

<div class="callout" markdown="1">

### Errors become assertions

When we first wrote `add-stamps.js`,
it didn't contain the assertion
that printed the error message shown above.
Once we tracked down our bug,
though,
we added the assertion to ensure we didn't make the same mistake again,
and as [%i "runnable documentation (assertions as)" "assertion!as runnable documentation" %][%g runnable_documentation "runnable documentation" %][%/i%]
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

[% inc file="pattern-user-read.js" %]

Before we try to run this,
let's add methods to show the state of our two internal data structures:

[% inc pat="pattern-user-show.*" fill="js sh out" %]

The output seems to be right,
so let's try expanding rules *after* building the graph and rules
but *before* expanding variables:

[% inc pat="pattern-user-run.*" fill="js out" %]

## What should we do next? {: #build-manager-next}

We have added a lot of steps to our original template method,
which makes it a bit of a stretch to claim that the overall operation hasn't changed.
Knowing what we know now,
we could go back and modify the original `SkeletonBuilder.build` method
to include those extra steps and provide do-nothing implementations.

The root of the problem is that we didn't anticipate all the steps that would be involved
when we wrote our template method.
It typically takes a few child classes for this to settle down;
if it never does,
then [%i "Template Method pattern" "design pattern!Template Method" %]Template Method[%/i%] is probably the wrong pattern for our situation.
This isn't a failure in initial design:
we always learn about our problem as we try to capture it in code,
and if we know enough to anticipate 100% of the issues that are going to come up,
it's time to put what we've learned in a library for future use.

## Exercises {: #build-manager-exercises}

### Handle failure {: .exercise}

1.  Modify the build manager to accommodate build steps that fail.

2.  Write Mocha tests to check that this change works correctly.

### Dry run {: .exercise}

Add an option to the build manager to show what commands would be executed and why
if a build were actually run.
For example,
the output should display things like, "'update A' because A older than B".

### Change directories {: .exercise}

Modify the build manager so that:

```sh
node build.js -C some/sub/directory rules.yml timestamps.yml
```

runs the build in the specified directory rather than the current directory.
{: .continue}

### Merge files {: .exercise}

Modify the build manager so that it can read multiple configuration files
and execute their combined rules.

### Show recipes {: .exercise}

Add a method to build manager to display all unique recipes,
i.e.,
all of the commands it might execute if asked to rebuild everything.

### Conditional execution {: .exercise}

Modify the build manager so that:

1.  The user can pass `variable=true` and `variable=false` arguments on the command-line
    to define variables.

2.  Rules can contain an `if: variable` field.

3.  Those rules are only executed if the variable is defined and true.

4.  Write Mocha tests to check that this works correctly.

### Define filesets {: .exercise}

Modify the build manager so that users can define sets of files:

```yml
fileset:
  name: everything
  contains:
    - X
    - Y
    - Z
```

and then refer to them later:
{: .continue}

```yml
- target: P
  depends:
  - @everything
```

### Globbing {: .exercise}

Modify the build manager so that it can dynamically construct a set of files:

```yml
glob:
  name: allAvailableInputs
  pattern: "./*.in"
```

and then refer to them later:
{: .continue}

```yml
- target: P
  depends:
  - @allAvailableInputs
```

### Use hashes {: .exercise}

1.  Write a program called `build-init.js` that calculates a hash
    for every file mentioned in the build configuration
    and stores the hash along with the file's name in `build-hash.json`.

2.  Modify the build manager to compare the current hashes of files
    with those stored in `build-hash.json`
    in order to determine what is out of date,
    and to update `build-hash.json` each time it runs.

### Auxiliary functions {: .exercise}

1.  Modify the builder manager so that it takes an extra argument `auxiliaries`
    containing zero or more named functions:

    ```js
    const builder = new ExtensibleBuilder(configFile, timesFile, {
      slice: (node, graph) => simplify(node, graph, 1)
    })
    ```

2.  Modify the `run` method to call these functions
    before executing the rules for a node,
    and to only execute the rules if all of them return `true`.

3.  Write Mocha tests to check that this works correctly.
