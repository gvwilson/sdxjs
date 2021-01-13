---
---

In <x key="file-backup">the previous chapter</x> we said that
operations in memory are thousands of times faster than operations that touch the filesystem,
but how accurate is that?
More generally,
given two ways to implement something,
how can we tell which is the most efficient?

The simplest way is usually to conduct some experiments.
To see how to do this,
we will take a look several ways to implement data tables
(sometimes called <g key="data_frame">data frames</g>)
like those in R's [tidyverse][tidyverse],
Python's [Pandas][pandas] library,
or the [DataForge][data-forge] library for JavaScript.
A data table has one or more named columns and zero or more rows;
each row has one value for each column,
and all the values in a column have the same type
(<f key="data-table-conceptual"></f>).

<%- include('/inc/figure.html', {
    id: 'data-table-conceptual',
    img: './figures/conceptual.svg',
    alt: 'Data table structure',
    cap: 'The structure of a data table.'
}) %>

The key operations on data tables are the same as those in <g key="sql">SQL</g>:
filter, select, summarize, and join.
These can be implemented in about 1000 lines of code,
but their performance depends on how the data table is stored.

## How can we implement data tables?

One way to store a table is <g key="row_major">row-major</g> order,
in which the values in each row are stored together in memory.
This is sometimes also called <g key="heterogeneous">heterogeneous</g> storage
because each "unit" of storage can contain values of different types.
In JavaScript,
we implement this as an array of objects
(<f key="data-table-storage-order"></f>).

Another option is <g key="column_major">column-major</g> or <g key="homogeneous">homogeneous</g> order,
in which all the values in a column are stored together.
In JavaScript,
this could be implemented using an object
whose members are all arrays of the same length.

<%- include('/inc/figure.html', {
    id: 'data-table-storage-order',
    img: './figures/storage-order.svg',
    alt: 'Row-major vs. column-major storage order',
    cap: 'Row-major storage vs. column-major storage for data tables.'
}) %>

To find out which is better
we will construct one of each,
try some operations,
record their execution times and memory use,
and then compare them.
The answer will depend on both the implementations
and on what mix of operations we measure:
for example,
if one strategy works better for filter and another for select,
the ratio of filters to selects may determine which is "best".

::: callout
### Immutability

All of our implementations will treat each data table as <g key="immutable">immutable</g>:
once we have created it,
we will not modify its contents.
This makes the programming easier
(and safer, since shared data structures are a rich source of bugs),
and doesn't actually have much impact on performance.
For example,
if we filter a data table stored in column major order,
we can either move elements in memory to fill the holes created by deleted rows,
or copy the values we want to keep to a new block of contiguous storage.
:::

For our first experiment,
let's build a row-major table with some number of columns.
To keep it simple,
we will repeat the values 0, 1, and 2 to fill the table.

<%- include('/inc/keep.html', {file: 'build.js', key: 'build-rows'}) %>

Next,
we write `filter` and `select` for tables laid out this way.
We need to provide a callback function to `filter` to determine which rows to keep
like the callback for `Array.filter`;
for selecting columns,
we provide a list of the keys that identify the columns we want to keep.
We expect filtering to be relatively fast,
since it is recycling rows,
while selecting should be relatively slow,
since we have to construct a new set of arrays
(<f key="data-table-row-ops"></f>).

<%- include('/inc/keep.html', {file: 'table-performance.js', key: 'operate-rows'}) %>

<%- include('/inc/figure.html', {
    id: 'data-table-row-ops',
    img: './figures/row-ops.svg',
    alt: 'Row-major operations',
    cap: 'Operations on row-major data tables.'
}) %>

Now let's do the same for column-major storage.
Building the object that holds the columns is straightforward:

<%- include('/inc/keep.html', {file: 'build.js', key: 'build-cols'}) %>

Filtering is more complex,
since the values in each row are scattered across several arrays,
but selecting is just a matter of recycling the arrays we want in the new table.
We expect selecting to be relatively fast,
since only the references to the columns need to be copied,
but filtering will be relatively slow since we are constructing multiple new arrays
(<f key="data-table-col-ops"></f>).

<%- include('/inc/keep.html', {file: 'table-performance.js', key: 'operate-cols'}) %>

<%- include('/inc/figure.html', {
    id: 'data-table-col-ops',
    img: './figures/col-ops.svg',
    alt: 'Column-major operations',
    cap: 'Operations on column-major data tables.'
}) %>

::: callout
### Not quite polymorphic

Our tests would be simpler to write if the two versions of `filter` and `select`
took exactly the same parameters,
but the row-testing functions for `filter` are different
because of the differences in the ways the tables are stored.
We could force them to be the same by (for example)
packing the values for each row in the column-major implementation
into a temporary object
and passing that to the same filtering function we used for the row-major implementation,
but that extra work would bias the performance comparison in row-major's favor.
:::

## How can we test the performance of our implementations?

Now that we have our tables and operations,
we can build a <g key="test_harness">test harness</g> to run those operations
on data tables of varying sizes.
We arbitrarily decide to keep half of the columns and one-third of the rows;
these ratios will affect our decision about which is better,
so if we were doing this for a real application we would test what happens
as these fractions vary.
And as we said earlier,
the relative performance will depend on the ratio of filters to selects;
our balance should be based on data from whatever application we intend to support.

Our performance measurement program looks like this:

<%- include('/inc/keep.html', {file: 'table-performance.js', key: 'main'}) %>

The functions that actually do the measurements
use the [`microtime`][microtime] library to get microsecond level timing
because JavaScript's `Date` only gives us millisecond-level resolution.
We use [`object-sizeof`][object-sizeof] to estimate memory how much memory our structures require;
We also call `process.memoryUsage()` and look at the `heapUsed` value,
but it may be affected by <g key="garbage_collection">garbage collection</g> and a host of other factors.

<%- include('/inc/keep.html', {file: 'table-performance.js', key: 'measure'}) %>

Let's run our program for a table with 100 rows and 3 columns and a 3:1 ratio of filter to select:

<%- include('/inc/multi.html', {pat: 'table-performance-100-03-03.*', fill: 'sh out'}) %>

::: continue
What if we increase the table size to 10,000 rows by 30 columns with the same 3:1 filter/select ratio?
:::

<%- include('/inc/file.html', {file: 'table-performance-10000-30-03.out'}) %>

::: continue
And if we keep the table size the same but use a 10:1 filter/select ratio?
:::

<%- include('/inc/file.html', {file: 'table-performance-10000-30-10.out'}) %>

<%- include('/inc/table.html', {
    id: 'data-table-performance',
    file: 'table-performance.tbl',
    cap: 'Relative performance of operations on row-major and column-major data tables.'
}) %>

The results in <t key="data-table-performance"></t> show that column-major storage is better.
It uses less memory (presumably because labels aren't duplicated),
and the time required to construct new objects when doing select with row-major storage
outweighs cost of appending to arrays when doing filter with column-major storage.
Unfortunately,
the code for column-major storage is a little more complicated to write,
which is a cost that doesn't show up in experiments.

## What is the most efficient way to save a table?

Our data tables are going to be stored in files of some kind.
If one storage scheme is much more efficient than another and we are reading or writing frequently,
that could change our mind about how to implement them.
Two simple text-based schemes are row-oriented and column-oriented [JSON](#json),
i.e.,
we just print the data structures we have.

Let's run the 10,000×30 test:

<%- include('/inc/file.html', {file: 'storage-performance-10000-30.out'}) %>

The time needed for the row-major version is almost ten times greater than
that needed for the column-major version;
again,
we assume that the redundant printing of the labels is at least partly to blame.

If that diagnosis is correct,
then a packed version of row-major storage ought to be faster.
We save the column headers once,
then copy the data values into an array of arrays and save that:

<%- include('/inc/keep.html', {file: 'packed-rows.js', key: 'packed'}) %>
<%- include('/inc/file.html', {file: 'packed-rows-10000-30.out'}) %>

These results show that packing the rows takes less time
than turning the data structure we have into a string.
Again,
we assume this is because copying data takes less time than turning labels into strings over and over,
but column-major storage is still the best approach.

## Does binary storage improve performance?

Let's try one more strategy for storing our tables.
JavaScript stores values in <g key="tagged_data">tagged</g> data structures:
some bits define the value's type,
and other bits store the actual data
(<f key="data-table-object-storage"></f>).

<%- include('/inc/figure.html', {
    id: 'data-table-object-storage',
    img: './figures/object-storage.svg',
    alt: 'JavaScript object storage',
    cap: 'How JavaScript uses tagged data structures to store objects.'
}) %>

We can save space by keeping track of the types ourselves
and just storing the bits that represent the values.
JavaScript has an `ArrayBuffer` class for exactly this purpose.
It stores any value we want as a set of bits;
we then access those bits through a view that presents the data as a particular type,
such as Boolean (one byte per value) or number (64 bits per number).
As <f key="data-table-packed-storage"></f> shows,
we can mix different types of data in a single `ArrayBuffer`,
but it's up to us to keep track of which bytes belong to which values.

<%- include('/inc/figure.html', {
    id: 'data-table-packed-storage',
    img: './figures/packed-storage.svg',
    alt: 'Packing objects for storage',
    cap: 'Storing object values as bits with lookup information.'
}) %>

To store a column-major table,
we will fill an `ArrayBuffer` with:

1.  Two integers that hold the table's dimensions.

1.  A string with the labels joined by newline characters.
    (We use newlines as a separator because we assume column labels can't contain them.)

1.  The numbers themselves.

<%- include('/inc/keep.html', {file: 'packed-cols.js', key: 'binary'}) %>
<%- include('/inc/file.html', {file: 'packed-cols-10000-30.out'}) %>

Packing the data table saves time
because copying bits is faster than turning numbers into characters,
but it doesn't save as much space as expected.
The reason is that double-precision numbers are 8 bytes long,
but because we have chosen simple integer values for our tests,
they can be represented by just 5 characters (which is 10 bytes).
If we had "real" numbers,
the storage benefit would probably be more pronounced.
