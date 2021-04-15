---
---

We've been writing tests since <span x="unit-test"/>,
but how much of our code do they actually check?
One way to find out is to use a <span g="code_coverage" i="code coverage">code coverage</span> tool
like <span i="Istanbul">[Istanbul][istanbul]</span>
that watches a program while it executes
and keeps track of which lines have run and which haven't.
Making sure that each line is tested at least once doesn't guarantee that the code is bug-free,
but any code that *isn't* run shouldn't be trusted.

Our code coverage tool will keep track of which functions have and haven't been called.
Rather than rewriting [Node][nodejs] to keep track of this for us,
we will modify the functions themselves
by parsing the code with <span i="Acorn">[Acorn][acorn]</span>,
inserting the instructions we need into the <span i="abstract syntax tree">AST</span>,
and then turning the AST back into code.

<div class="callout" markdown="1">

### Simple usually isn't

At first glance it would be a lot simpler
to use regular expressions to find every line that looks like the start of a function definition
and insert a line right after each one
to record the information we want.
Of course,
some people split function headers across several lines if they have lots of parameters,
and there might be things that look like function definitions embedded in comments or strings.
It doesn't take long before our simple solution turns into
a poorly-implemented parser for a subset of JavaScript that no-one else understands.
Using a full-blown parser and working with the AST is almost always less work.

</div>

## How can we replace a function with another function?

The first thing we need is a way to wrap up an arbitrary function call.
If we declare a function in JavaScript with a parameter like `...args`,
all of the "extra" arguments in the call that don't line up with regular parameters
are stuffed into the variable `args`
(<span f="code-generator-spread"/>).
We can also call a function by putting values in a variable
and using `func(...var)` to <span i="spread!function arguments">spread</span> those values out.
There's nothing special about the names `args` and `vars`:
what matters is the ellipsis `...`

{% include figure
   id='code-generator-spread'
   img='figures/spread.svg'
   alt='Spreading parameters'
   cap='Using ...args to capture and spread parameters.' %}

We can use `...args` to capture all of the arguments to a function call
and forward them to another function.
Let's start by creating functions with a varying number of parameters
that run to completion or throw an exception,
then run them to make sure they do what we want:

{% include keep file='replace-func.js' key='original' %}

We can now write a function that takes a function as an input
and creates a new function that handles all of the errors in the original function:

{% include keep file='replace-func.js' key='replace' %}

Let's try it out:

{% include file file='replace-func.out' %}

This is an example of the <span g="decorator_pattern" i="Decorator pattern; design pattern!Decorator">Decorator</span> design pattern.
A decorator is a function whose job is to modify the behavior of other functions
in some general ways.
Decorators are built in to some languages (like <span i="Python">[Python][python]</span>),
and we can add them in most others as we have done here.

## How can we generate JavaScript?

We could use a decorator to replace every function in our program
with one that keeps track of whether or not it was called,
but it would be tedious to apply the decorator to every one of our functions by hand.
What we really want is a way to do this automatically for everything,
and for that we need to parse and generate code.

<div class="callout" markdown="1">

### Other ways to do it

A third way to achieve what we want is
to let the system turn code into runnable instructions
and then modify those instructions.
This approach is often used in compiled languages like <span i="Java">[Java][java]</span>,
where the <span g="byte_code">byte code</span> produced by the <span g="compiler">compiler</span> is saved in files
in order to be run.
We can't do this here because Node compiles and runs code in a single step.

</div>

Our tool will parse the JavaScript with Acorn to create an AST,
modify the AST,
and then use a library called <span i="Escodegen">[Escodegen][escodegen]</span> to turn the AST back into JavaScript.
To start,
let's look at the AST for a simple function definition,
which is {% include linecount file='func-def.out' %} lines of pretty-printed JSON:

{% include multi pat='func-def.*' fill='js out' %}

After inspecting a few nodes,
we can try to create some of our own and turn them into code.
Here,
for example,
we have the JSON representation of the expression `40+2`:

{% include multi pat='one-plus-two.*' fill='js out' %}

## How can we count how often functions are executed?

Our tool will find all the function declaration nodes in the program
and insert a node to increment an entry in a global variable called `__counters`.
(Prefixing the name with two underscores doesn't guarantee that
we won't accidentally clobber a variable in the user's program with the same name,
but hopefully it makes that less likely.)
Our test case is:

{% include keep file='multi-func-counter.js' key='test' %}

{: .continue}
and the main function of our program is:

{% include keep file='multi-func-counter.js' key='main' %}

To insert a count we call `insertCounter`
to record the function's name and modify the node:

{% include keep file='multi-func-counter.js' key='insert' %}

{: .continue}
Notice how we don't try to build the nodes by hand,
but instead construct the string we need,
use <span i="Acorn">Acorn</span> to parse that,
and use the result.
Doing this saves us from embedding multiple lines of JSON in our program
and also ensures that if a newer version of Acorn decides to generate a different AST,
our program will do the right thing automatically.

Finally,
we need to add a couple of <span i="helper function">helper functions</span>:

{% include keep file='multi-func-counter.js' key='admin' %}

{: .continue}
and run it to make sure it all works:

{% include file file='multi-func-counter.out' %}

<div class="callout" markdown="1">

### Too simple to be safe

Our simple approach to naming counters doesn't work if functions can have the same names,
which they can if we use modules or <span g="nested_function" i="nested function; function!nested">nested functions</span>.
One way to solve this would be to manufacture a label from the function's name
and the line number in the source code;
another would be to keep track of which functions are nested within which
and concatenate their names to produce a unique key.
Problems like this are why people say that naming things
is one of the <span g="two_hard_problems" i="two hard problems in computer science">two hard problems</span> in computer science.

</div>

## How can we time function execution?

Now that we have a way to insert code into functions
we can use it to do many other things.
For example,
we can find out how long it takes functions to run
by wrapping them up in code that records the start and end time of each call.
As before,
we find the nodes of interest and decorate them,
then stitch the result together with a bit of bookkeeping:

{% include keep file='time-func.js' key='timeFunc' %}

Gathering nodes is straightforward:

{% include keep file='time-func.js' key='gatherNodes' %}

{: .continue}
as is wrapping the function definition:

{% include keep file='time-func.js' key='wrapFuncDef' %}

The only big difference is how we make the wrapper function.
We create it with a placeholder for the original function
so that we have a spot in the AST to insert the actual code:

{% include keep file='time-func.js' key='timeFunc' %}

Let's run one last test:

{% include file file='test-time-func.out' %}

Source-to-source translation is widely used in JavaScript:
tools like <span i="Babel">[Babel][babel]</span> use it to transform modern features like `async` and `await`
(<span x="async-programming"/>)
into code that older browsers can understand.
The technique is so powerful that it is built into languages like Scheme,
which allow programmers to add new syntax to the language
by defining <span g="macro" i="macro">macros</span>.
Depending on how carefully they are used,
macros can make programs elegant, incomprehensible, or both.
