---
---

-   Goal: find and run unit tests and report their results
    -   Inspired by [Mocha][mocha] and [Jest][jest]
-   Design:
    -   Find files containing tests
    -   Load those files
    -   As they load, those files register the tests to be run
    -   We then execute the registered tests and capture results
    -   When all tests are done, we report
-   Lots of other designs are possible
    -   E.g., run tests as soon as files load rather than collecting and running later

## How should we handle unit testing?

-   Every unit test:
    -   Is a function of zero arguments so that it can be called uniformly
    -   Creates a <g key="fixture">fixture</g> to be tested
    -   Uses <g key="assertion">assertions</g>
        to compare the <g key="actual_result">actual result</g>
        against the <g key="expected_result">expected result</g>
-   Possible results are:
    -   <g key="pass_test">Pass</g>: works as expected
    -   <g key="fail_test">Fail</g>: something is wrong with the code being tested
    -   <g key="error_test">Error</g>: something wrong in the test itself,
        so we know nothing certain about the system being tested
-   We need some way to distinguish failure from error
    -   Rely on the fact that exceptions are objects
    -   If the object is an instance of `assert.AssertionError`
        then it was <g key="throw_exception">thrown</g> by an assertion,
        which (probably) means it's coming out of one of our checks
    -   Any other kind of assertion is unexpected

## How can we separate test registration, execution, and reporting?

-   Use <g key="global_variable">global variables</g> to record tests and results
-   The function `hopeThat` saves a message and a callback function
    -   Don't run tests immediately because we want to wrap each one in our own <g key="exception_handler">exception handler</g>
-   `main` runs all registered tests
    -   If a test completes without an exception, it passes
    -   If any of the `assert` calls raises an `AssertionError`, it fails
    -   If it raises any other exception, it's an error
-   Tests are run in the order in which they're registered, but we shouldn't rely on that
-   After all tests are run, report counts

<%- include('/_inc/multi.html', {pat: 'dry-run.*', fill: 'js out'}) %>

-   Critique
    -   Doesn't tell us *which* tests failed
    -   We don't have a way to test that things raise `AssertionError` when they should
    -   Those global variables should be bundled together somehow

## How should we structure test registration?

-   The `hope` module uses the <g key="singleton_pattern">Singleton</g> <g key="design_pattern">design pattern</g>
    -   A class that only has one instance
    -   Singletons are a structured way to manage global variables
    -   Less code to rewrite and re-test if we change our minds later about only having one
-   Defines class and exports an instance of that class
    -   Relies on Node <g key="caching">caches</g> modules so that each is only loaded once
-   `Hope.test` records a test for later execution
-   `Hope.run` executes all the tests registered so far
-   Provide two flavors of output (terse one-liner and full details)
-   Also provide raw material (title and results) for inspection and formatting (e.g., as HTML)

<%- include('/_inc/file.html', {file: 'hope.js'}) %>

-   Use the [`caller`][caller] module to find the name of who's calling the current function
    -   Gives the user more information
    -   Automatically correct (unlike handwritten strings that can fall out of step)

## How can we build a command-line driver for our test manager?

-   Keeping the files containing tests simple is the most important part of our design
-   Example in `test-add.js`

<%- include('/_inc/file.html', {file: 'test-add.js'}) %>

-   Load those <g key="dynamic_loading">dynamically</g>
    -   `require` is just a function
    -   Takes a path as a parameter and reads that file
-   Loading files executes the code they contain
    -   Which registers tests as a <g key="side_effect">side effect</g> of calls to `hope.test`
-   Final part is the command-line tool that finds and loads tests
    -   Parse command-line arguments using the [`minimist`][minimist] module
    -   Use the filenames provided or find and load all files that match `test-*.js`
    -   Call `hope.run()` to run all the tests they have registered
    -   Report results
-   Doesn't export anything, just runs

<%- include('/_inc/multi.html', {pat: 'pray.*', fill: 'js sh out'}) %>

::: callout
### Filenames in `minimist`

If we use a command line like `pray.js -v something.js`,
then `something.js` becomes the value of `-v`.
To indicate that we want `something.js` added to the list of trailing filenames
associated with the special key `_` (a single underscore),
we have to write `pray.js -v -- something.js`.
The double dash is a common Unix convention for signalling the end of parameters.
:::

-   Trace the <g key="lifecycle">lifecycle</g> of a pair of files `test-add.js` and `test-sub.js`
    -   `pray` uses `glob` to find files with tests
    -   It loads `test-add.js` using `require`
    -   As `test-add.js` runs, it loads `hope.js`
    -   Which creates a single instance of the class `Hope`
    -   `test-add.js` uses `hope.test` to register a test (which does *not* run yet)
    -   `pray` then loads `test-sub.js`
        -   `require('./hope')` in `test-sub.js` does *not* reload `hope.js` because that's already in memory
        -   So the variable `hope` in `test-sub.js` refers to the same (unique) instance of `Hope` already created
        -   So when `test-sub.js` calls `hope.test`, its test is added to that object
    -   `pray` then asks that unique instance of `Hope` to run all of the tests
    -   And then gets a report from it
-   Note that `1/0` is a failure rather than an error
    -   JavaScript thinks the result is `Infinity` rather than an exception

## What about promises?

::: fixme
modify test harness to use promises
:::

<%- include('/_inc/problems.html') %>
