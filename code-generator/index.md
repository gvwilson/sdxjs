---
---

We've been writing tests since <x key="unit-test"></x>,
but how much of our code do they actually exercise?
One way to find out is to use a <g key="code_coverage">code coverage</g> tool like [Istanbul][istanbul]
that watches a program while it executes
and keeps track of which lines have run and which haven't.
Running each line at least once doesn't guarantee that the code is bug-free,
but any code that *isn't* run during tested shouldn't be trusted.

Our code coverage tool will keep track of which functions have and haven't been called.
Since we don't want to rewrite [Node][nodejs] to make a note each time every function is called,
we will modify the functions themselves
by parsing the code with [Acorn][acorn],
inserting the instructions we need into the AST,
and then turning the AST back into code.

## How can we replace a function with another function?

The first thing we need is a way to wrap up an arbitrary function call.
If we declare a function in JavaScript with a parameter like `...args`,
all of the "extra" arguments in the call that don't line up with regular parameters
are stuffed into `args`
(<f key="code-generator-spread"></f>).
We can also call a function by putting values in a variable
and using `func(...var)` to spread those values out.

<%- include('/inc/fig.html', {
    id: 'code-generator-spread-errors',
    img: '/static/tools-small.jpg',
    alt: 'Spreading parameters',
    cap: 'Using ...args to capture and spread parameters.',
    fixme: true
}) %>

We can use `...args` to capture all of the arguments to a function call
and forward them to another function.
Let's start by creating functions with a varying number of parameters
that run to completion or throw an exception,
then run them to make sure they do what we want:

<%- include('/inc/keep.html', {file: 'replace-func.js', key: 'original'}) %>

We can now write a function that takes a function as an input
and creates a new function that handles all of the errors in the original function:

<%- include('/inc/keep.html', {file: 'replace-func.js', key: 'replace'}) %>

Let's try it out:

<%- include('/inc/file.html', {file: 'replace-func.out'}) %>

This is an example of the <g key="decorator_pattern">Decorator</g> pattern.
A decorator is a function whose job is to modify the behavior of other functions
in some general ways.
Decorators are built in to some languages (like Python),
and we can add them to most others as we have done here.

## How can we generate JavaScript?

We could use a decorator to replace every function in our program
with one that kept track of whether or not it was called,
but we would have to apply it to every one of our functions.
What we really want is a way to do this automatically for everything;
for that, we need to parse and generate code.

::: callout
### Other ways to do it

A third way to achieve what we want is
to let the system turn code into runnable instructions
and then modify those instructions.
We can't do this because [Node][nodejs] doesn't save the generated <g key="byte_code">byte code</g>
for us to play with.
In other languages,
such as Java,
this can be an attractive approach.
:::

Our tool will parse the JavaScript with [Acorn][acorn] to create an AST,
modify the AST,
and then use a library called [Escodegen][escodegen] to turn the AST back into JavaScript.
To start,
let's look at the Acorn parse tree for a simple function definition,
which is <%- include('/inc/linecount.html', {file: 'func-def.out'}) %> lines of pretty-printed JSON:

<%- include('/inc/multi.html', {pat: 'func-def.*', fill: 'js out'}) %>

After inspecting a few nodes,
we can try to create a few of our own and turn them into code:

<%- include('/inc/multi.html', {pat: 'one-plus-two.*', fill: 'js out'}) %>

## How can we count how often functions are executed?

Our tool will find all the function declaration nodes in the program
and insert a node to increment an entry in a global variable called `__counters`.
Our test case is:

<%- include('/inc/keep.html', {file: 'multi-func-counter.js', key: 'test'}) %>

::: continue
and the main function of our program is:
:::

<%- include('/inc/keep.html', {file: 'multi-func-counter.js', key: 'main'}) %>

To insert a count we call `insertCounter`,
which records the function's name and modifies the node:

<%- include('/inc/keep.html', {file: 'multi-func-counter.js', key: 'insert'}) %>

::: continue
Notice how we don't try to build the nodes by hand,
but instead construct the string we need,
use [Acorn][acorn] to parse that,
and use the result.
Doing this saves us from embedding multiple lines of JSON in our program
and also ensures that if the AST for our code ever changes,
the program will do the right thing automatically.
:::

Finally,
we need to add a couple of helper functions:

<%- include('/inc/keep.html', {file: 'multi-func-counter.js', key: 'admin'}) %>

::: continue
and to run it to make sure it all works:
:::

<%- include('/inc/file.html', {file: 'multi-func-counter.out'}) %>

::: callout
### Too simple to be safe

Our simple approach doesn't work if functions can have the same names,
which they can if we use modules or <g key="nested_function">nested functions</g>.
One way to solve this would be to manufacture a label from the function's name
and the line number in the source code.
:::

## How can we time function execution?

We can use this same strategy to do many other things.
For example,
we can find out how long it takes functions to run
by wrapping them up in code that records the start and end time of each call.
As before,
we find the nodes of interest and decorate them,
then stitch the result together with a bit of administrative code:

<%- include('/inc/keep.html', {file: 'time-func.js', key: 'timeFunc'}) %>

Gathering nodes is straightforward:

<%- include('/inc/keep.html', {file: 'time-func.js', key: 'gatherNodes'}) %>

::: continue
as is wrapping the function definition:
:::

<%- include('/inc/keep.html', {file: 'time-func.js', key: 'wrapFuncDef'}) %>

The only big difference is how we make the wrapper function.
We create it with a placeholder for the original function
so that we have a spot in the AST to insert the actual code:

<%- include('/inc/keep.html', {file: 'time-func.js', key: 'timeFunc'}) %>

One more test:

<%- include('/inc/file.html', {file: 'test-time-func.out'}) %>

Source-to-source translation is widely used in JavaScript:
tools like [Babel][babel] use it to turn modern features like `async` and `await`
(<x key="async-programming"></x>)
into code that older browsers can understand.
The technique is so powerful that it is built into languages like Scheme,
which allow programmers to add new syntax to the language
by defining <g key="macro">macros</g>.
Depending on how carefully they are used,
macros can make programs extremely elegant,
practically incomprehensible,
or both.
