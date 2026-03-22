---
title: "Code Generator"
---

We've been writing tests since [%x unit-test %],
but how much of our code do they actually check?
One way to find out is to use a [%g code_coverage "code coverage" %] tool
like [Istanbul][istanbul]
that watches a program while it executes
and keeps track of which lines have run and which haven't.
Making sure that each line is tested at least once doesn't guarantee that the code is bug-free,
but any code that *isn't* run shouldn't be trusted.

Our code coverage tool will keep track of which functions have and haven't been called.
Rather than rewriting [Node][nodejs] to keep track of this for us,
we will modify the functions themselves
by parsing the code with [Acorn][acorn],
inserting the instructions we need into the AST,
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

## How can we replace a function with another function? {: #code-generator-replace}

The first thing we need is a way to wrap up an arbitrary function call.
If we declare a function in JavaScript with a parameter like `...args`,
all of the "extra" arguments in the call that don't line up with regular parameters
are stuffed into the variable `args`
([%f code-generator-spread %]).
We can also call a function by putting values in a variable
and using `func(...var)` to spread those values out.
There's nothing special about the names `args` and `vars`:
what matters is the ellipsis `...`

[%figure slug=code-generator-spread img=spread.svg alt="Spreading parameters" caption="Using ...args to capture and spread parameters." %]

We can use `...args` to capture all of the arguments to a function call
and forward them to another function.
Let's start by creating functions with a varying number of parameters
that run to completion or throw an exception,
then run them to make sure they do what we want:

[%inc replace-func.js mark=original %]

We can now write a function that takes a function as an input
and creates a new function that handles all of the errors in the original function:

[%inc replace-func.js mark=replace %]

Let's try it out:

[%inc replace-func.out %]

This is an example of the [%g decorator_pattern "Decorator" %] design pattern.
A decorator is a function whose job is to modify the behavior of other functions
in some general ways.
Decorators are built in to some languages (like [Python][python]),
and we can add them in most others as we have done here.

## How can we generate JavaScript? {: #code-generator-generate}

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
This approach is often used in compiled languages like [Java][java],
where the [%g byte_code "byte code" %] produced by the [%g compiler "compiler" %] is saved in files
in order to be run.
We can't do this here because Node compiles and runs code in a single step.

</div>

Our tool will parse the JavaScript with Acorn to create an AST,
modify the AST,
and then use a library called [Escodegen][escodegen] to turn the AST back into JavaScript.
To start,
let's look at the AST for a simple function definition,
which is [%linecount func-def.out %] lines of pretty-printed JSON:

[%inc pat=func-def.* fill="js out" %]

After inspecting a few nodes,
we can create some of our own and turn them into code.
Here,
for example,
we have the JSON representation of the expression `40+2`:

[%inc pat=one-plus-two.* fill="js out" %]

## How can we count how often functions are executed? {: #code-generator-count}

Our tool will find all the function declaration nodes in the program
and insert a node to increment an entry in a global variable called `__counters`.
(Prefixing the name with two underscores doesn't guarantee that
we won't accidentally clobber a variable in the user's program with the same name,
but hopefully it makes that less likely.)
Our test case is:

[%inc multi-func-counter.js mark=test %]

and the main function of our program is:


[%inc multi-func-counter.js mark=main %]

To insert a count we call `insertCounter`
to record the function's name and modify the node:

[%inc multi-func-counter.js mark=insert %]

Notice how we don't try to build the nodes by hand,
but instead construct the string we need,
use Acorn to parse that,
and use the result.
Doing this saves us from embedding multiple lines of JSON in our program
and also ensures that if a newer version of Acorn decides to generate a different AST,
our program will do the right thing automatically.


Finally,
we need to add a couple of helper functions:

[%inc multi-func-counter.js mark=admin %]

and run it to make sure it all works:


[%inc multi-func-counter.out %]

<div class="callout" markdown="1">

### Too simple to be safe

Our simple approach to naming counters doesn't work if functions can have the same names,
which they can if we use modules or [%g nested_function "nested functions" %].
One solution would be to manufacture a label from the function's name
and the line number in the source code;
another would be to keep track of which functions are nested within which
and concatenate their names to produce a unique key.
Problems like this are why people say that naming things
is one of the [%g two_hard_problems "two hard problems" %] in computer science.

</div>

## How can we time function execution? {: #code-generator-time}

Now that we have a way to insert code into functions
we can use it to do many other things.
For example,
we can find out how long it takes functions to run
by wrapping them up in code that records the start and end time of each call.
As before,
we find the nodes of interest and decorate them,
then stitch the result together with a bit of bookkeeping:

[%inc time-func.js mark=timeFunc %]

Gathering nodes is straightforward:

[%inc time-func.js mark=gatherNodes %]

as is wrapping the function definition:


[%inc time-func.js mark=wrapFuncDef %]

The only big difference is how we make the wrapper function.
We create it with a placeholder for the original function
so that we have a spot in the AST to insert the actual code:

[%inc time-func.js mark=timeFunc %]

Let's run one last test:

[%inc test-time-func.out %]

Source-to-source translation is widely used in JavaScript:
tools like [Babel][babel] use it to transform modern features like `async` and `await`
([%x async-programming %])
into code that older browsers can understand.
The technique is so powerful that it is built into languages like Scheme,
which allow programmers to add new syntax to the language
by defining [%g macro "macros" %].
Depending on how carefully they are used,
macros can make programs elegant, incomprehensible, or both.

<section class="exercises" markdown="1">
## Exercises {: #code-generator-exercises}

### JSON to JavaScript 

Write a tool that uses [Escodegen][escodegen]
to translate simple expressions written in JSON into runnable JavaScript.
For example, the tool should translate:

```js
['+', 3, ['*', 5, 'a']]
```

into:


```js
3 + (5 * a)
```

### JavaScript to HTML 

Write a function that takes nested JavaScript function calls for generating HTML like this:

```js
div(h1('title'), p('explanation'))
```

and turns them into HTML like this:


```
<div><h1>title</h1><p>explanation</p></div>
```

### Handling modules 

Modify the code that counts the number of times a function is called
to handle functions with the same name from different modules.

### Tracking calls 

Write a decorator that takes a function as its argument
and returns a new function that behaves exactly the same way
except that it keeps track of who called it.

1.  The program contains a stack where decorated functions push and pop their names
    as they are called and as they exit.

2.  Each time a function is called
    it adds a record to an array to record its name and the name at the top of the stack
    (i.e., the most-recently-called decorated function).

### Counting classical function definitions 

Modify the code generator to handle functions declared with the `function` keyword
as well as functions declared using `=>`.

### Recording input file size 

1.  Write a program that replaces all calls to `fs.readFileSync`
    with calls to `readFileSyncCount`.

2.  Write the function `readFileSyncCount` to read and return a file using `fs.readFileSync`
    but to also record the file's name and size in bytes.

3.  Write a third function `reportInputFileSizes` that reports
    what files were read and how large they were.

4.  Write tests for these functions using Mocha and `mock-fs`.

### Checking argument types 

Write a tool that modifies functions to check the types of their arguments at run-time.

1.  Each function is replaced by a function that passes all of its arguments to `checkArgs`
    along with the function's name,
    then continues with the function's original operation.

2.  The first time `checkArgs` is called for a particular function
    it records the actual types of the arguments.

3.  On subsequent calls, it checks that the argument types match those of the first call
    and throws an exception if they do not.

### Two-dimensional arrays 

The function `make2D` takes a row length and one or more values
and creates a two-dimensional array from those values:

```js
make2D(2, 'a', 'b', 'c', 'd')
// produces [['a', 'b'], ['c', 'd']]
```

Write a function that searches code to find calls to `make2D`
and replaces them with inline arrays-of-arrays.
This function only has to work for calls with a fixed row length,
i.e., it does *not* have to handle `make2D(N, 'a', 'b')`.


### From require to import 

Write a function that searches code for simple calls to `require`
and replaces them with calls to `import`.
This function only needs to work for the simplest case;
for example, if the input is:

```js
const name = require('module')
```

then the output is:


```js
import name from 'module'
```

### Removing empty constructors 

Write a function that removes empty constructors from class definitions.
For example, if the input is:

```js
class Example {
  constructor () {
  }

  someMethod () {
    console.log('some method')
  }
}
```

then the output should be:


```js
class Example {
  someMethod () {
    console.log('some method')
  }
}
```

</section>
