---
title: "Unit Testing"
---

We have written many small programs in the previous two chapters,
but haven't really tested any of them.
That's OK for [%i "exploratory programming" %][%g exploratory_programming "exploratory programming" %][%/i%],
but if our software is going to be used instead of just read,
we should try to make sure it works.

A tool for writing and running [%i "unit test!requirements for" %][%g unit_test "unit tests" %][%/i%] is a good first step.
Such a tool should:

-   find files containing tests;
-   find the tests in those files;
-   run the tests;
-   capture their results; and
-   report each test's result and a summary of those results.

Our design is inspired by tools like [%i "Mocha" %][Mocha][mocha][%/i%] and [%i "Jest" %][Jest][jest][%/i%],
which were in turn inspired by tools built for other languages
from the 1980s onward [%b Meszaros2007 Tudose2020 %].

## How should we structure unit testing? {: #unit-test-structure}

As in other unit testing frameworks,
each test will be a function of zero arguments
so that the framework can run them all in the same way.
Each test will create a [%i "fixture (in unit test)" "unit test!fixture" %][%g fixture "fixture" %][%/i%] to be tested
and use [%i "assertion!in unit test" %][%g assertion "assertions" %][%/i%]
to compare the [%i "actual result (in unit test)" "unit test!actual result" %][%g actual_result "actual result" %][%/i%]
against the [%i "expected result (in unit test)" "unit test!expected result" %][%g expected_result "expected result" %][%/i%].
The outcome can be exactly one of:

-   [%i "pass (in unit test)" "unit test!pass" %][%g pass_test "Pass" %][%/i%]:
    the [%i "test subject (in unit test)" "unit test!test subject" %][%g test_subject "test subject" %][%/i%] works as expected.

-   [%i "fail (in unit test)" "unit test!fail" %][%g fail_test "Fail" %][%/i%]:
    something is wrong with the test subject.

-   [%i "error (in unit test)" "unit test!error" %][%g error_test "Error" %][%/i%]:
    something is wrong in the test itself,
    which means we don't know whether the test subject is working properly or not.

To make this work,
we need some way to distinguish failing tests from broken ones.
Our solution relies on the fact that exceptions are objects
and that a program can use [%i "introspection!in unit testing" %][%g introspection "introspection" %][%/i%]
to determine the class of an object.
If a test [%i "exception!throw" %][%g throw_exception "throws an exception" %][%/i%] whose class is `assert.AssertionError`,
then we will assume the exception came from
one of the assertions we put in the test as a check
([%f unit-test-mental-model %]).
Any other kind of assertion indicates that the test itself contains an error.

[% figure
   slug="unit-test-mental-model"
   img="mental-model.svg"
   alt="Mental model of unit testing"
   caption="Running tests that can pass, fail, or contain errors."
%]

## How can we separate registration, execution, and reporting? {: #unit-test-design}

To start,
let's use a handful of [%g global_variable "global variables" %] to record tests and their results:

[% inc file="dry-run.js" keep="state" %]

We don't run tests immediately
because we want to wrap each one in our own [%i "exception!handler" %][%g exception_handler "exception handler" %][%/i%].
Instead,
the function `hopeThat` saves a descriptive message and a callback function that implements a test
in the `HopeTest` array.

[% inc file="dry-run.js" keep="save" %]

<div class="callout" markdown="1">

### Independence

Because we're appending tests to an array,
they will be run in the order in which they are registered,
but we shouldn't rely on that.
Every unit test should work independently of every other
so that an error or failure in an early test
doesn't affect the result of a later one.

</div>

Finally,
the function `main` runs all registered tests:

[% inc file="dry-run.js" keep="main" %]

If a test completes without an exception, it passes.
If any of the `assert` calls inside the test raises an `AssertionError`,
the test fails,
and if it raises any other exception,
it's an error.
After all tests are run,
`main` reports the number of results of each kind.
{: .continue}

Let's try it out:

[% inc file="dry-run.js" keep="use" %]
[% inc file="dry-run.out" %]

This simple "framework" does what it's supposed to, but:

1.  It doesn't tell us which tests have passed or failed.

1.  Those global variables should be consolidated somehow
    so that it's clear they belong together.

1.  It doesn't discover tests on its own.

1.  We don't have a way to test things that are supposed to raise `AssertionError`.
    Putting assertions into code to check that it is behaving correctly
    is called [%g defensive_programming "defensive programming" %];
    it's a good practice,
    but we should make sure those assertions are failing when they're supposed to,
    just as we should test our smoke detectors every once in a while.

## How should we structure test registration? {: #unit-test-registration}

The next version of our testing tool solves the first two problems in the original
by putting the testing machinery in a class.
It uses the [%i "Singleton pattern" "design pattern!Singleton" %][%g singleton_pattern "Singleton" %][%/i%] [%g design_pattern "design pattern" %]
to ensure that only one object of that class is ever created [%b Osmani2017 %].
Singletons are a way to manage global variables that belong together
like the ones we're using to record tests and their results.
As an extra benefit,
if we decide later that we need several copies of those variables,
we can just construct more instances of the class.

The file `hope.js` defines the class and exports one instance of it:

[% inc file="hope.js" omit="report" %]

This strategy relies on two things:

1.  [Node][nodejs] executes the code in a JavaScript module as it loads it,
    which means that it runs `new Hope()` and exports the newly-created object.

1.  Node [%i "cache!modules" "require!caching modules" %][%g caching "caches" %][%/i%] modules
    so that a given module is only loaded once
    no matter how many times it is imported.
    This ensures that `new Hope()` really is only called once.

Once a program has imported `hope`,
it can call `Hope.test` to record a test for later execution
and `Hope.run` to execute all of the tests registered up until that point
([%f unit-test-hope-structure %]).

[% figure
   slug="unit-test-hope-structure"
   img="hope-structure.svg"
   alt="Recording and running tests"
   caption="Creating a singleton, recording tests, and running them."
%]

<div class="pagebreak"></div>

Finally,
our `Hope` class can report results as both a terse one-line summary and as a detailed listing.
It can also provide the titles and results of individual tests
so that if someone wants to format them in a different way (e.g., as HTML) they can do so:

[% inc file="hope.js" keep="report" %]

<div class="callout" markdown="1">

### Who's calling?

`Hope.test` uses the [%i "caller module" %][`caller`][caller][%/i%] module
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

</div>

## How can we build a command-line interface for testing? {: #unit-test-cli}

Most programmers don't enjoy writing tests,
so if we want them to do it,
we have to make it as painless as possible.
A couple of `import` statements to get `assert` and `hope`
and then one function call per test
is about as simple as we can make the tests themselves:

[% inc file="test-add.js" %]

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

Here,
`all-the-tests.js` imports other files so that they will register tests
as a [%i "side effect!for module registration" %][%g side_effect "side effect" %][%/i%] via calls to `hope.test`
and then calls `Hope.run` to execute them.
It works,
but sooner or later (probably sooner) someone will forget to import one of the test files.
{: .continue}

A better strategy is to load test files [%i "dynamic loading" %][%g dynamic_loading "dynamically" %][%/i%].
While `import` is usually written as a statement,
it can also be used as an `async` function
that takes a path as a parameter and loads the corresponding file.
The program `pray.js` (shown below) does this;
as before,
loading files executes the code they contain,
which registers tests as a side effect:

[% inc file="pray.js" omit="options" %]

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

<div class="callout" markdown="1">

### Filenames in `minimist`

If we use a command line like `pray.js -v something.js`,
then `something.js` becomes the value of `-v`.
To indicate that we want `something.js` added to the list of trailing filenames
associated with the special key `_` (a single underscore),
we have to write `pray.js -v -- something.js`.
The double dash is a common Unix convention for signalling the end of parameters.

</div>

Our [%i "test runner" "unit test!test runner" %][%g test_runner "test runner" %][%/i%] is now complete,
so we can try it out with some files containing tests that pass, fail, and contain errors:

[% inc pat="pray.*" fill="sh out" %]

<div class="callout" markdown="1">

### Infinity is allowed

`test-div.js` contains the line:

```js
hope.test('Quotient of 1 and 0', () => assert((1 / 0) === 0))
```

This test counts as a failure rather than an error
because the result of dividing by zero is the special value `Infinity`
rather than an arithmetic error.
{: .continue}

</div>

Loading modules dynamically so that they can register something for us to call later
is a common pattern in many programming languages.
Control flow goes back and forth between the framework and the module being loaded
as this happens
so we must specify the [%i "lifecycle!of unit test" "unit test!lifecycle" %][%g lifecycle "lifecycle" %][%/i%] of the loaded modules quite carefully.
[%f unit-test-lifecycle %] illustrates what happens
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

[% figure
   slug="unit-test-lifecycle"
   img="lifecycle.svg"
   alt="Unit testing lifecycle"
   caption="Lifecycle of dynamically-discovered unit tests."
%]

## Exercises {: #unit-test-exercises}

### Asynchronous globbing {: .exercise}

Modify `pray.js` to use the asynchronous version of `glob` rather than `glob.sync`.

### Timing tests {: .exercise}

Install the [`microtime`][microtime] package and then modify the `dry-run.js` example
so that it records and reports the execution times for tests.

### Approximately equal {: .exercise}

1.  Write a function `assertApproxEqual` that does nothing if two values are within a certain tolerance of each other
    but throws an exception if they are not:

        // throws exception
        assertApproxEqual(1.0, 2.0, 0.01, 'Values are too far apart')

        // does not throw
        assertApproxEqual(1.0, 2.0, 10.0, 'Large margin of error')

2.  Modify the function so that a default tolerance is used if none is specified:

        // throws exception
        assertApproxEqual(1.0, 2.0, 'Values are too far apart')

        // does not throw
        assertApproxEqual(1.0, 2.0, 'Large margin of error', 10.0)

3.  Modify the function again so that it checks the [%g relative_error "relative error" %]
    instead of the [%g absolute_error "absolute error" %].
    (The relative error is the absolute value of the difference between the actual and expected value,
    divided by the absolute value.)

### Rectangle overlay {: .exercise}

A windowing application represents rectangles using objects with four values:
`x` and `y` are the coordinates of the lower-left corner,
while `w` and `h` are the width and height.
All values are non-negative:
the lower-left corner of the screen is at `(0, 0)`
and the screen's size is `WIDTH`x`HEIGHT`.

1.  Write tests to check that an object represents a valid rectangle.

2.  The function `overlay(a, b)` takes two rectangles and returns either
    a new rectangle representing the region where they overlap or `null` if they do not overlap.
    Write tests to check that `overlay` is working correctly.

3.  Do your tests assume that two rectangles that touch on an edge overlap or not?
    What about two rectangles that only touch at a single corner?

### Selecting tests {: .exercise}

Modify `pray.js` so that if the user provides `-s pattern` or `--select pattern`
then the program only runs tests in files that contain the string `pattern` in their name.

### Tagging tests {: .exercise}

Modify `hope.js` so that users can optionally provide an array of strings to tag tests:

```js
hope.test('Difference of 1 and 2',
          () => assert((1 - 2) === -1),
          ['math', 'fast'])
```

Then modify `pray.js` so that if users specify either `-t tagName` or `--tag tagName`
only tests with that tag are run.

### Mock objects {: .exercise}

A mock object is a simplified replacement for part of a program
whose behavior is easier to control and predict than the thing it is replacing.
For example,
we may want to test that our program does the right thing if an error occurs while reading a file.
To do this,
we write a function that wraps `fs.readFileSync`:

```js
const mockReadFileSync = (filename, encoding = 'utf-8') => {
  return fs.readFileSync(filename, encoding)
}
```

and then modify it so that it throws an exception under our control.
For example,
if we define `MOCK_READ_FILE_CONTROL` like this:
{: .continue}

```js
const MOCK_READ_FILE_CONTROL = [false, false, true, false, true]
```

then the third and fifth calls to `mockReadFileSync` throw an exception instead of reading data,
as do any calls after the fifth.
Write this function.
{: .continue}

### Setup and teardown {: .exercise}

Testing frameworks often allow programmers to specify a `setup` function
that is to be run before each test
and a corresponding `teardown` function
that is to be run after each test.
(`setup` usually re-creates complicated test fixtures,
while `teardown` functions are sometimes needed to clean up after tests,
e.g., to close database connections or delete temporary files.)

Modify the testing framework in this chapter so that
if a file of tests contains something like this:

```js
const createFixtures = () => {
  ...do something...
}

hope.setup(createFixtures)
```

then the function `createFixtures` will be called
exactly once before each test in that file.
Add a similar way to register a teardown function with `hope.teardown`.
{: .continue}

### Multiple tests {: .exercise}

Add a method `hope.multiTest` that allows users to specify
multiple test cases for a function at once.
For example, this:

```js
hope.multiTest('check all of these`, functionToTest, [
  [['arg1a', 'arg1b'], 'result1'],
  [['arg2a', 'arg2b'], 'result2'],
  [['arg3a', 'arg3b'], 'result3']
])
```

should be equivalent to this:
{: .continue}

```js
hope.test('check all of these 0',
  () => assert(functionToTest('arg1a', 'arg1b') === 'result1')
)
hope.test('check all of these 1',
  () => assert(functionToTest('arg2a', 'arg2b') === 'result2')
)
hope.test('check all of these 2',
  () => assert(functionToTest('arg3a', 'arg3b') === 'result3')
)
```

### Assertions for sets and maps {: .exercise}

1.  Write functions `assertSetEqual` and `assertMapEqual`
    that check whether two instances of `Set` or two instances of `Map` are equal.

2.  Write a function `assertArraySame`
    that checks whether two arrays have the same elements,
    even if those elements are in different orders.

### Testing promises {: .exercise}

Modify the unit testing framework to handle `async` functions,
so that:

```js
hope.test('delayed test', async () => {...})
```

does the right thing.
(Note that you can use `typeof` to determine whether the object given to `hope.test`
is a function or a promise.)
{: .continue}
