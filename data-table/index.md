---
---

-   Many applications work with data tables (sometimes called <g key="data_frame">data frames</g>)
    -   Examples include R's [tidyverse][tidyverse] and [DataForge][data-forge]
    -   Fixed set of named columns, each holding a specific type of data
    -   Any number of rows
-   Key operations are the same as those in SQL: filter, select, summarize, join
-   Do some experiments to choose an implementation before writing lots of code

## What is the most efficient way to store a data table?

-   One approach is <g key="row_major">row-major</g>
    -   Array of <g key="heterogeneous">heterogeneous</g> rows
    -   In JavaScript, an array of objects
-   Another is <g key="column_major">column-major</g>
    -   Each named column stored as a <g key="homogeneous">homogeneous</g> array
    -   In JavaScript, an object whose members are all arrays of the same length

::: fixme
diagram of row-major vs. column-major
:::

-   Construct one of each, try some operations, record times and memory use, see which is better
    -   Answer will depend on what parameters we use
-   Never modify data after creating it
    -   Allows us to recycle memory
-   Build a row-major table with some number of columns
    -   Values are 0, 1, 2, 0, 1, 2, etc.

<%- include('/_inc/keep.html', {file: 'build.js', key: 'build-rows'}) %>

-   Add filter with a callback function to select rows
    -   Should be fast, since we are recycling the rows
-   And select with a list of column labels
    -   Should be slow, since we are constructing one new object per row

<%- include('/_inc/keep.html', {file: 'table-performance.js', key: 'operate-rows'}) %>

-   Now do the same for column-major storage
-   Build

<%- include('/_inc/keep.html', {file: 'build.js', key: 'build-cols'}) %>

-   Operate
    -   Select should be fast, since we are just aliasing some columns
    -   Filter should be slow, since we are constructing multiple new arrays
    -   The parameters to the two functions are different from those to the row-major functions

<%- include('/_inc/keep.html', {file: 'table-performance.js', key: 'operate-cols'}) %>

-   Build a <g key="test_harness">test harness</g> to run both variants for data tables of some size
    -   Arbitrarily decide to keep half of the columns and one-third of the rows
    -   This choice will affect our decision about which is better
-   Also calculate relative performance based on ratio of filters to selects
    -   Should also be based on data from whatever application we're trying to support

<%- include('/_inc/keep.html', {file: 'table-performance.js', key: 'main'}) %>

-   Actual measurement functions
    -   Use [microtime][microtime] to get micro-second level timing (since JavaScript's `Date` is only millisecond-level)
    -   Use [object-sizeof][object-sizeof] to estimate memory
    -   Also call `process.memoryUsage()` and look at `heapUsed`, but that value may be affected by garbage collection

<%- include('/_inc/keep.html', {file: 'table-performance.js', key: 'measure'}) %>

-   Run for a table 100 rows by 3 columns with a 3-1 ratio of filter to select

<%- include('/_inc/multi.html', {pat: 'table-performance-100-03-03.*', fill: 'sh out'}) %>

-   10,000 rows by 30 columns with the same 3-1 filter/select ratio

<%- include('/_inc/file.html', {file: 'table-performance-10000-30-03.out'}) %>

-   Same large table with a 10-1 filter/select ratio

<%- include('/_inc/file.html', {file: 'table-performance-10000-30-10.out'}) %>

-   Conclusion: column-major is better
    -   Uses less memory (presumably because labels aren't duplicated)
    -   Cost of constructing new objects when doing select with row-major storage
        outweighs cost of appending to arrays when doing filter with column-major storage
-   Unfortunately makes the code itself a little more complicated to write
    -   A cost that doesn't show up in experiments

## What is the most efficient way to save a table?

-   Our data tables are going to be stored in files of some kind
-   If one storage scheme is much more efficient than another and we are reading/writing frequently,
    that could change our mind about how to implement them
-   Two text-based schemes are obvious
    -   Row-oriented as JSON
    -   Column-oriented as JSON
-   Run the 10,000×30 test

<%- include('/_inc/file.html', {file: 'storage-performance-10000-30.out'}) %>

-   Time needed for the row-oriented version is almost ten times greater than that needed for the column-oriented version
-   Also try a packed version of row-oriented
    -   Save the column headers once
    -   Copy the data values into an array of arrays and save that

<%- include('/_inc/keep.html', {file: 'packed-rows.js', key: 'packed'}) %>
<%- include('/_inc/file.html', {file: 'packed-rows-10000-30.out'}) %>

-   Surprising that packing the rows takes *less* time
    -   The cost of copying data is less than the cost of turning labels into strings over and over
-   Once again seems clear that column-oriented storage is the best approach

## Does binary storage improve performance?

-   JavaScript stores values in <g key="tagged_data">tagged</g> data structures
    -   Some bits to define its type
    -   Other bits with the actual data
-   And despite what `sizeof` tells us, objects and arrays have structural overhead
-   We can save space by just storing the bits, but then we have to keep track of types ourselves
-   JavaScript has an `ArrayBuffer` object that stores bits
-   We access it through a view that presents the data as a particular type, such as unsigned 8-bit integer or 64-bit float
-   To store a column-oriented table:
    -   Two integers with size
    -   A string with the labels joined by newlines (we assume that labels can't contain newlines)
    -   The numbers

<%- include('/_inc/keep.html', {file: 'packed-cols.js', key: 'binary'}) %>
<%- include('/_inc/file.html', {file: 'packed-cols-10000-30.out'}) %>

-   Saves time because copying bits is faster than turning numbers into characters
-   But doesn't save as much space as expected
    -   Our numbers are 8 bytes long
    -   Longest string representation is 5 characters (10 bytes)
