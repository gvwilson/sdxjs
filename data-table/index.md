---
---

-   Many applications work with data tables (sometimes called <g key="data_frame">data frames</g>)
    -   Examples include R's [tidyverse][tidyverse] and [DataForge][data-forge]
    -   Fixed set of named columns, each holding a specific type of data
    -   Any number of rows
-   Key operations are the same as those in SQL: filter, select, summarize, join
-   Do some experiments to choose an implementation before writing lots of code

## What is the most efficient way to store a data table?

-   One approach is <g key="row_wise">row-wise</g>
    -   Array of <g key="heterogeneous">heterogeneous</g> rows
    -   In JavaScript, an array of objects
-   Another is <g key="column_wise">column-wise</g>
    -   Each named column stored as a <g key="homogeneous">homogeneous</g> array
    -   In JavaScript, an object whose members are all arrays of the same length
-   Construct one of each, try some operations, record times and memory use, see which is better
    -   Answer will probably depend on...things
-   Data never modified after it is created
    -   Allows us to recycle memory
-   Build a row-wise table with some number of columns
    -   Values are 0, 1, 2, 0, 1, 2, etc.

<%- include('/_inc/slice.html', {file: 'build.js', tag: 'build-rows'}) %>

-   Add filter with a callback function to select rows
    -   Should be fast, since we are recycling the rows
-   And select with a list of column labels
    -   Should be slow, since we are constructing one new object per row

<%- include('/_inc/slice.html', {file: 'table-performance.js', tag: 'operate-rows'}) %>

-   Now do the same for column-wise storage
-   Build

<%- include('/_inc/slice.html', {file: 'build.js', tag: 'build-cols'}) %>

-   Operate
    -   Select should be fast, since we are just aliasing some columns
    -   Filter should be slow, since we are constructing multiple new arrays
    -   The parameters to the two functions are different from those to the row-wise functions

<%- include('/_inc/slice.html', {file: 'table-performance.js', tag: 'operate-cols'}) %>

-   Build a <g key="test_harness">test harness</g> to run both variants for data tables of some size
    -   Arbitrarily decide to keep half of the columns and one-third of the rows
    -   This choice will affect our decision about which is better
-   Also calculate relative performance based on ratio of filters to selects
    -   Should also be based on data from whatever application we're trying to support

<%- include('/_inc/slice.html', {file: 'table-performance.js', tag: 'main'}) %>

-   Actual measurement functions
    -   Use [microtime][microtime] to get micro-second level timing (since JavaScript's `Date` is only millisecond-level)
    -   Use [object-sizeof][object-sizeof] to estimate memory
    -   Also call `process.memoryUsage()` and look at `heapUsed`, but that value may be affected by garbage collection

<%- include('/_inc/slice.html', {file: 'table-performance.js', tag: 'measure'}) %>

-   Run for a table 100 rows by 3 columns with a 3-1 ratio of filter to select

<%- include('/_inc/multi.html', {pat: 'table-performance-100-03-03.*', fill: 'sh txt'}) %>

-   10,000 rows by 30 columns with the same 3-1 filter/select ratio

<%- include('/_inc/file.html', {file: 'table-performance-10000-30-03.txt'}) %>

-   Same large table with a 10-1 filter/select ratio

<%- include('/_inc/file.html', {file: 'table-performance-10000-30-10.txt'}) %>

-   Conclusion: column-wise is better
    -   Uses less memory (presumably because labels aren't duplicated)
    -   Cost of constructing new objects when doing select with row-wise storage
        outweighs cost of appending to arrays when doing filter with column-wise storage
-   Unfortunately makes the code itself a little more complicated to write
    -   A cost that doesn't show up in experiments

## What is the most efficient way to save a table?

-   Our data tables are going to be stored in files of some kind
-   If one storage scheme is much more efficient than another and we are reading/writing frequently,
    that could change our mind about how to implement them
-   Two text-based schemes are obvious
    -   Row-oriented as JSON
    -   Column-oriented as JSON
-   Run the 10,000x30 test

<%- include('/_inc/file.html', {file: 'storage-performance-10000-30.txt'}) %>

-   Time needed for the row-oriented version is almost ten times greater than that needed for the column-oriented version
-   Also try a packed version of row-oriented
    -   Save the column headers once
    -   Copy the data values into an array of arrays and save that

<%- include('/_inc/slice.html', {file: 'packed-performance.js', tag: 'packed'}) %>
<%- include('/_inc/file.html', {file: 'packed-performance-10000-30.txt'}) %>

-   Surprising that packing the rows takes *less* time
    -   The cost of copying data is less than the cost of turning labels into strings over and over
-   Once again seems clear that column-oriented storage is the best approach
