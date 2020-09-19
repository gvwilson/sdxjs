---
---

-   Goal: find and run unit tests and report their results
    -   Inspired by [Mocha][mocha] and [Jest][jest]
-   Design:
    -   Find files containing tests
    -   Load those files
    -   Those files register the tests to be run
    -   We then execute the registered tests and capture results
    -   When all tests are done, we report

## How should we handle unit testing?

-   Every unit test:
    -   Is a function of zero arguments so that it can be called uniformly
    -   Creates a <g key="fixture">fixture</g> to be tested
    -   Uses <g key="assertion">assertions</g>
        to compare the <g key="actual_result">actual result</g>
        against the <g key="expected_result">expected result</g>
-   Possible results are:
    -   <g key="unit_test_pass">Pass</g>: works as expected
    -   <g key="unit_test_fail">Fail</g>: something wrong with the code being tested
    -   <g key="unit_test_error">Error</g>: something wrong in the test itself

## How can we separate test registration, execution, and reporting?

-   Use <g key="global_variable">global variables</g> to record tests and results
-   `hopeThat` records a callback and a message
    -   Don't run tests immediately because we want to wrap each one in our own <g key="exception_handler">exception handler</g>
-   `main` runs all registered tests
    -   If it completes without an exception, it passes
    -   If any of the `assert` calls raises an `AssertionError`, it fails
    -   If it raises any other exception, it's an error
-   Tests are run in the order in which they're registered, but we shouldn't rely on that
-   After all tests are run, report counts

<%- include('/inc/code.html', {file: 'dry-run.js'}) %>

<%- include('/inc/code.html', {file: 'dry-run.text'}) %>

-   Critique
    -   A bunch of global variables with similar names will lead to problems later
    -   We don't have a way to test that things raise `AssertionError` when they should
    -   Doesn't tell us which tests failed

## How should we structure test registration?

-   The `hope` module uses the <g key="singleton_pattern">Singleton</g> pattern
    -   A class that only has one instance
    -   A structured way to manage global variables
-   Defines class
    -   Exports an instance of that class
    -   Relies on Node <g key="caching">caches</g> modules so that each is only loaded once
-   `Hope.test` records a test for later execution
-   `Hope.run` executes each
-   Provide two flavors of output (terse one-liner and full details)
-   Also provide raw material (title and results) for other formatters

<%- include('/inc/code.html', {file: 'hope.js'}) %>

## How can we build a command-line driver for our test manager?

-   Find files named `test-*.js` below a user-specified root directory
-   Example in `test-add.js`
    -   Keeping this simple is the most important part of our design

<%- include('/inc/code.html', {file: 'test-add.js'}) %>

-   Load those <g key="dynamic_loading">dynamically</g>
    -   This executes the code they contain
    -   Which registers tests as a <g key="side_effect">side effect</g>

-   Final part is the command-line tool that finds and loads tests
    -   Parse command-line options
    -   Find and load all files that match `test-*.js`
    -   Call `hope.run()` to run all the tests they have registered
    -   Report results
-   Doesn't export anything, just runs

<%- include('/inc/code.html', {file: 'pray.js'}) %>

-   Run

<%- include('/inc/code.html', {file: 'pray.sh'}) %>

<%- include('/inc/code.html', {file: 'pray.text'}) %>

-   Trace the <g key="lifecycle">lifecycle</g>
    -   `pray` uses `glob` to find files with test
    -   Loads `test-add.js` using `require`
    -   As `test-add.js` runs, it loads `hope.js`
    -   Which creates a single instance of the class `Hope`
    -   `test-add.js` uses `hope.test` to register a test (which does *not* run yet)
    -   `pray` then loads `test-sub.js`
    -   `require('./hope')` does *not* reload `hope.js` because that's already in memory
    -   So the variable `hope` in `test-sub.js` refers to the same (unique) instance of `Hope` already created
    -   So when `test-sub.js` calls `hope.test`, its test is added to that object
    -   `pray` then asks that unique instance of `Hope` to run all of the tests
    -   And then gets a report from it
-   Note that `1/0` is a failure rather than an error
    -   JavaScript thinks the result is `Infinity` rather than an exception
