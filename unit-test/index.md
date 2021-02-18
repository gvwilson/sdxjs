---
---

We have written many small programs in the previous two chapters,
but haven't really tested any of them.
That's OK for <g key="exploratory_programming">exploratory programming</g>,
but if our software is going to be used instead of just read,
we should try to make sure it works.

A tool for writing and running <g key="unit_test">unit tests</g> is a good first step.
Such a tool should:

-   find files containing tests;
-   find the tests in those files;
-   run the tests;
-   capture their results; and
-   report each test's result and a summary of those results.

Our design is inspired by tools like [Mocha][mocha] and [Jest][jest],
which were in turn inspired by tools built for other languages
from the 1980s onward <cite>Meszaros2007,Tudose2020</cite>.

## How should we structure unit testing?

As in other unit testing frameworks,
each test will be a function of zero arguments
so that the framework can run them all in the same way.
Each test will create a <g key="fixture">fixture</g> to be tested
and use <g key="assertion">assertions</g>
to compare the <g key="actual_result">actual result</g>
against the <g key="expected_result">expected result</g>.
The outcome can be exactly one of:

-   <g key="pass_test">Pass</g>:
    the <g key="test_subject">test subject</g> works as expected.

-   <g key="fail_test">Fail</g>:
    something is wrong with the test subject.

-   <g key="error_test">Error</g>:
    something wrong in the test itself,
    which means we don't know whether the test subject is working properly or not.

To make this work,
we need some way to distinguish failing tests from broken ones.
Our solution relies on the fact that exceptions are objects
and that a program can use <g key="introspection">introspection</g>
to determine the class of an object.
If a test <g key="throw_exception">throws an exception</g> whose class is `assert.AssertionError`,
then we will assume the exception came from
one of the assertions we put in the test as a check
(<f key="unit-test-mental-model"></f>).
Any other kind of assertion indicates that the test itself contains an error.

<%- include('/inc/figure.html', {
    id: 'unit-test-mental-model',
    img: './figures/mental-model.svg',
    alt: 'Mental model of unit testing',
    cap: 'Running tests that can pass, fail, or contain errors.'
}) %>

## How can we separate test registration, execution, and reporting?

To start,
let's use a handful of <g key="global_variable">global variables</g> to record tests and their results:

<%- include('/inc/keep.html', {file: 'dry-run.js', key: 'state'}) %>

We don't run tests immediately
because we want to wrap each one in our own <g key="exception_handler">exception handler</g>.
Instead,
the function `hopeThat` saves a descriptive message and a callback function that implements a test
in the `HopeTest` array.

<%- include('/inc/keep.html', {file: 'dry-run.js', key: 'save'}) %>

::: callout
### Independence

Because we're appending tests to an array,
they will be run in the order in which they are registered,
but we shouldn't rely on that.
Every unit test should work independently of every other
so that an error or failure in an early test
doesn't affect the result of a later one.
:::

Finally,
the function `main` runs all registered tests:

<%- include('/inc/keep.html', {file: 'dry-run.js', key: 'main'}) %>

::: continue
If a test completes without an exception, it passes.
If any of the `assert` calls inside the test raises an `AssertionError`,
the test fails,
and if it raises any other exception,
it's an error.
After all tests are run,
`main` reports the number of results of each kind.
:::

Let's try it out:

<%- include('/inc/keep.html', {file: 'dry-run.js', key: 'use'}) %>
<%- include('/inc/file.html', {file: 'dry-run.out'}) %>

This simple "framework" does what it's supposed to, but:

1.  It doesn't tell us which tests have passed or failed.

1.  Those global variables should be consolidated somehow
    so that it's clear they belong together.

1.  It doesn't discover tests on its own.

1.  We don't have a way to test things that are supposed to raise `AssertionError`.
    Putting assertions into code to check that it is behaving correctly
    is called <g key="defensive_programming">defensive programming</g>;
    it's a good practice,
    but we should make sure those assertions are failing when they're supposed to,
    just as we should test our smoke detectors every once in a while.

## How should we structure test registration?

The next version of our testing tool solves the first two problems in the original
by putting the testing machinery in a class.
It uses the <g key="singleton_pattern">Singleton</g> <g key="design_pattern">design pattern</g>
to ensure that only one object of that class is ever created.
Singletons are a way to manage global variables that belong together
like the ones we're using to record tests and their results.
As an extra benefit,
if we decide later that we need several copies of those variables,
we can just construct more instances of the class.

The file `hope.js` defines the class and exports one instance of it:

<%- include('/inc/keep.html', {file: 'hope.js', key: 'report'}) %>

This strategy relies on two things:

1.  [Node][nodejs] executes the code in a JavaScript module as it loads it,
    which means that it runs `new Hope()` and exports the newly-created object.

1.  [Node][nodejs] <g key="caching">caches</g> modules
    so that a given module is only loaded once
    no matter how many times it is imported.
    This ensures that `new Hope()` really is only called once.

Once a program has imported `hope`,
it can call `Hope.test` to record a test for later execution
and `Hope.run` to execute all of the tests registered up until that point
(<f key="unit-test-hope-structure"></f>).

<%- include('/inc/figure.html', {
    id: 'unit-test-hope-structure',
    img: './figures/hope-structure.svg',
    alt: 'Recording and running tests',
    cap: 'Creating a singleton, recording tests, and running them.'
}) %>

Finally,
our `Hope` class can report results as both a terse one-line summary and as a detailed listing.
It can also provide the titles and results of individual tests
so that if someone wants to format them in a different way (e.g., as HTML) they can do so:

<%- include('/inc/keep.html', {file: 'hope.js', key: 'report'}) %>

::: callout
### Who's calling?

`Hope.test` uses the [`caller`][caller] module
to get the name of the function that is registering a test.
Reporting the test's name helps the user figure out where to start debugging;
getting it via introspection
rather than requiring the user to pass the function's name as a string
reduces typing
and guarantees that what we report is accurate.
Programmers will often copy, paste, and modify tests;
sooner or later (probably sooner) they will forget to modify
the copy-and-pasted function name being passed into `Hope.test`
and will then lose time trying to figure out why `test_this` is failing
when the failure is actually in `test_that`.
:::

## How can we build a command-line interface for our test manager?

Most programmers don't enjoy writing tests,
so if we want them to do it,
we have to make it as painless as possible.
A couple of `import` statements to get `assert` and `hope`
and then one function call per test
is about as simple as we can make the tests themselves:

<%- include('/inc/file.html', {file: 'test-add.js'}) %>

But that just defines the tests---how will we find them so that we can run them?
One option is to require people to `import` each of the files containing tests
into another file:

```js
// all-the-tests.js

import './test-add.js'
import './test-sub.js'
import './test-mul.js'
import './test-div.js'

Hope.run()
...
```

:::continue
Here,
`all-the-tests.js` imports other files so that they will register tests
as a <g key="side_effect">side effect</g> via calls to `hope.test`
and then calls `Hope.run` to execute them.
It works,
but sooner or later (probably sooner) someone will forget to import one of the test files.
:::


A better strategy is to load test files <g key="dynamic_loading">dynamically</g>.
While `import` is usually written as a statement,
it can also be used as an `async` function
that takes a path as a parameter and loads the corresponding file.
As before,
loading files executes the code they contain,
which registers tests as a side effect:

<%- include('/inc/erase.html', {file: 'pray.js', key: 'options'}) %>

By default,
this program finds all files below the current working directory
whose names match the pattern `test-*.js`
and uses terse output.
Since we may want to look for files somewhere else,
or request verbose output,
the program needs to handle command-line arguments.

The [`minimist`][minimist] module does this
in a way that is consistent with Unix conventions.
Given command-line arguments *after* the program's name
(i.e., from `process.argv[2]` onward),
it looks for patterns like `-x something`
and creates an object with flags as keys and values associated with them.

::: callout
### Filenames in `minimist`

If we use a command line like `pray.js -v something.js`,
then `something.js` becomes the value of `-v`.
To indicate that we want `something.js` added to the list of trailing filenames
associated with the special key `_` (a single underscore),
we have to write `pray.js -v -- something.js`.
The double dash is a common Unix convention for signalling the end of parameters.
:::

Our <g key="test_runner">test runner</g> is now complete,
so we can try it out with some files containing tests that pass, fail, and contain errors:

<%- include('/inc/multi.html', {pat: 'pray.*', fill: 'sh out'}) %>

::: callout
### Infinity is allowed

`test-div.js` contains the line:

```js
hope.test('Quotient of 1 and 0', () => assert((1 / 0) === 0))
```

This test counts as a failure rather than an error
because thinks the result of dividing by zero is the special value `Infinity`
rather than an arithmetic error.
:::

Loading modules dynamically so that they can register something for us to call later
is a common pattern in many programming languages.
Control flow goes back and forth between the framework and the module being loaded
as this happens
so we must specify the <g key="lifecycle">lifecycle</g> of the loaded modules quite carefully.
<f key="unit-test-lifecycle"></f> illustrates what happens
when a pair of files `test-add.js` and `test-sub.js` are loaded by our framework:

1.  `pray` loads `hope.js`.
2.  Loading `hope.js` creates a single instance of the class `Hope`.
3.  `pray` uses `glob` to find files with tests.
4.  `pray` loads `test-add.js` using `import` as a function.
5.  As `test-add.js` runs, it loads `hope.js`.
    Since `hope.js` is already loaded, this does not create a new instance of `Hope`.
6.  `test-add.js` uses `hope.test` to register a test (which does not run yet).
7.  `pray` then loads `test-sub.js`…
8.   …which loads `Hope`…
9.   …then registers a test.
10.  `pray` can now ask the unique instance of `Hope` to run all of the tests,
     then get a report from the `Hope` singleton and display it.

<%- include('/inc/figure.html', {
    id: 'unit-test-lifecycle',
    img: './figures/lifecycle.svg',
    alt: 'Unit testing lifecycle',
    cap: 'Lifecycle of dynamically-discovered unit tests.'
}) %>
