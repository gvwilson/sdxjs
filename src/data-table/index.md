---
template: page
title: "Data Tables"
lede: "Storing and manipulating tables efficiently"
---

[% x systems-programming %] said that
operations in memory are thousands of times faster than operations that touch the filesystem,
but what about different in-memory operations---how do they compare with each other?
Putting it another way,
how can we tell which of several designs is going to be the most efficient?

The best answer is to conduct some [% i "experiments" %]experiments[% /i %].
To see how to do this,
we will take a look several ways to implement data tables
with one or more named columns and zero or more rows.
Each row has one value for each column,
and all the values in a column have the same type
([% f data-table-conceptual %]).
Data tables appear over and over again in programming,
from spreadsheets and databases
to the [% i "data frame" %][% g data_frame %]data frames[% /g %][% /i %] in
[% i "R" %]R's[% /i %] [% i "tidyverse" %][tidyverse][tidyverse][% /i %] packages,
[% i "Python" %][Python's][python][% /i %] [% i "Pandas" %][Pandas][pandas][% /i %] library,
or the [% i "DataForge" %][DataForge][data-forge][% /i %] library for JavaScript [% b Davis2018 %].

[% figure slug="data-table-conceptual" img="figures/conceptual.svg" alt="Data table structure" caption="The structure of a data table." %]

The key operations on data tables are those provided by [% i "SQL" %][% g sql %]SQL[% /g %][% /i %]:
filter, select, summarize, and join.
These can be implemented in about five hundred lines of code,
but their performance depends on how the data table is stored.

## How can we implement data tables? {#data-table-implement}

One way to store a table is [% i "row-major storage order" "storage order!row-major" %][% g row_major %]row-major[% /g %][% /i %] order,
in which the values in each row are stored together in memory.
This is sometimes also called [% i "heterogeneous storage" "storage!heterogeneous" %][% g heterogeneous %]heterogeneous[% /g %][% /i %] storage
because each "unit" of storage can contain values of different types.
We can implement this design in JavaScript using an array of objects,
each of which has the same keys
([% f data-table-storage-order %]).

Another option is [% i "column-major storage order" "storage order!column-major" %][% g column_major %]column-major[% /g %][% /i %]
or [% i "homogeneous storage" "storage!homogeneous" %][% g homogeneous %]homogeneous[% /g %][% /i %] order,
in which all the values in a column are stored together.
In JavaScript,
this could be implemented using an object
whose members are all arrays of the same length.

[% figure slug="data-table-storage-order" img="figures/storage-order.svg" alt="Row-major vs. column-major storage order" caption="Row-major storage vs. column-major storage for data tables." %]

To find out which is better
we will construct one of each,
try some operations,
record their execution times and memory use,
and then compare them.
Crucially,
the answer will depend on both the implementations themselves
and on what mix of operations we measure.
For example,
if one strategy works better for filter and another for select,
the ratio of filters to selects may determine which is "best".

> ### Immutability
>
> All of our implementations will treat each data table as [% i "immutable data" %][% g immutable %]immutable[% /g %][% /i %]:
> once we have created it,
> we will not modify its contents.
> This doesn't actually have much impact on performance
> an makes the programming easier and safer,
> since shared data structures are a rich source of bugs.

For our first experiment,
let's build a row-major table with some number of columns.
To keep it simple,
we will repeat the values 0, 1, and 2 to fill the table.

[% excerpt file="build.js" keep="build-rows" %]

Next,
we write `filter` and `select` for tables laid out this way.
We need to provide a callback function to `filter` to determine which rows to keep
like the callback for `Array.filter`;
for selecting columns,
we provide a list of the keys that identify the columns we want to keep.
We expect filtering to be relatively fast,
since it is [% i "recycling data" %]recycling[% /i %] rows,
while selecting should be relatively slow because we have to construct a new set of arrays
([% f data-table-row-ops %]).

[% excerpt file="table-performance.js" keep="operate-rows" %]

[% figure slug="data-table-row-ops" img="figures/row-ops.svg" alt="Row-major operations" caption="Operations on row-major data tables." %]

Now let's do the same for column-major storage.
Building the object that holds the columns is straightforward:

[% excerpt file="build.js" keep="build-cols" %]

Filtering is more complex because the values in each row are scattered across several arrays,
but selecting is just a matter of recycling the arrays we want in the new table.
We expect selecting to be relatively fast,
since only the references to the columns need to be copied,
but filtering will be relatively slow since we are constructing multiple new arrays
([% f data-table-col-ops %]).

[% excerpt file="table-performance.js" keep="operate-cols" %]

[% figure slug="data-table-col-ops" img="figures/col-ops.svg" alt="Column-major operations" caption="Operations on column-major data tables." %]

> ### Not quite polymorphic
>
> Our tests would be simpler to write if the two versions of `filter` and `select`
> took exactly the same parameters,
> but the row-testing functions for `filter` are different
> because of the differences in the ways the tables are stored.
> We could force them to be the same by (for example)
> packing the values for each row in the column-major implementation
> into a temporary object
> and passing that to the same filtering function we used for the row-major implementation,
> but that extra work would bias the performance comparison in row-major's favor.

## How can we test the performance of our implementations? {#data-table-profile}

Now that we have our tables and operations,
we can build a [% i "test harness" "experiments!test harness" %][% g test_harness %]test harness[% /g %][% /i %] to run those operations
on data tables of varying sizes.
We arbitrarily decide to keep half of the columns and one-third of the rows;
these ratios will affect our decision about which is better,
so if we were doing this for a real application we would test what happens
as these fractions vary.
And as we said earlier,
the relative performance will also depend on the how many filters we do for each select;
our balance should be based on data from whatever application we intend to support.

Our performance measurement program looks like this:

[% excerpt file="table-performance.js" keep="main" %]

The functions that actually do the measurements
use the [`microtime`][microtime] library to get microsecond level timing
because JavaScript's `Date` only gives us millisecond-level resolution.
We use [`object-sizeof`][object-sizeof] to estimate memory how much memory our structures require;
we also call `process.memoryUsage()` and look at the `heapUsed` value
to see how much memory [Node][nodejs] is using while the program runs,
but that may be affected by [% g garbage_collection %]garbage collection[% /g %]
and a host of other factors outside our control.

[% excerpt file="table-performance.js" keep="measure" %]

Let's run our program for a table with 100 rows and 3 columns and a 3:1 ratio of filter to select:

[% excerpt pat="table-performance-100-03-03.*" fill="sh out" %]

<!-- continue -->
What if we increase the table size to 10,000 rows by 30 columns with the same 3:1 filter/select ratio?

[% excerpt file="table-performance-10000-30-03.out" %]

<!-- continue -->
And if we keep the table size the same but use a 10:1 filter/select ratio?

[% excerpt file="table-performance-10000-30-10.out" %]

<div class="table" id="data-table-performance" caption="Relative performance of operations on row-major and column-major data tables." markdown="1">
value|100-03-03|10000-30-03|10000-30-10
:---|---:|---:|---:
nRows|100|10000|10000
nCols|3|30|30
filterPerSelect|3|3|10
rowFilterTime|75|2929|2376
rowSelectTime|111|15863|15566
colFilterTime|137|4529|4380
colSelectTime|48|104|90
</div>

The results in [% t data-table-performance %] show that column-major storage is better.
It uses less memory (presumably because column labels aren't duplicated once per row)
and the time required to construct new objects when doing select with row-major storage
outweighs cost of appending to arrays when doing filter with column-major storage.
Unfortunately,
the code for column-major storage is a little more complicated to write,
which is a cost that doesn't show up in experiments.

## What is the most efficient way to save a table? {#data-table-save}

Data is valuable,
so we are going to store data tables in files of some kind.
If one storage scheme is much more efficient than another and we are reading or writing frequently,
that could change our mind about which implementation to pick.

Two simple text-based schemes are row-oriented and column-oriented [% g json %]JSON[% /g %]---basically,
just printing the data structures we have.
Let's run the 10,000×30 test:

[% excerpt file="storage-performance-10000-30.out" %]

The time needed for the row-major version is almost ten times greater than
that needed for the column-major version;
we assume that the redundant printing of the labels is mostly to blame,
just as redundant storage of the labels was to blame for row-major's greater memory requirements.

If that diagnosis is correct,
then a packed version of row-major storage ought to be faster.
We save the column headers once,
then copy the data values into an array of arrays and save that:

[% excerpt file="packed-rows.js" keep="packed" %]
[% excerpt file="packed-rows-10000-30.out" %]

These results show that changing layout for storage
is faster than turning the data structure we have into a string.
Again,
we assume this is because copying data takes less time than turning labels into strings over and over,
but column-major storage is still the best approach.

## Does binary storage improve performance? {#data-table-binary}

Let's try one more strategy for storing our tables.
JavaScript stores values in [% i "tagged data structure" %][% g tagged_data %]tagged[% /g %][% /i %] data structures:
some bits define the value's type
while other bits store the value itself in a type-dependent way
([% f data-table-object-storage %]).

[% figure slug="data-table-object-storage" img="figures/object-storage.svg" alt="JavaScript object storage" caption="How JavaScript uses tagged data structures to store objects." %]

We can save space by keeping track of the types ourselves
and just storing the bits that represent the values.
JavaScript has an [% i "ArrayBuffer" %]`ArrayBuffer`[% /i %] class for exactly this purpose.
It stores any value we want as a set of bits;
we then access those bits through a view that presents the data as a particular type,
such as Boolean (one byte per value) or number (64 bits per number).
As [% f data-table-packed-storage %] shows,
we can mix different types of data in a single `ArrayBuffer`,
but it's up to us to keep track of which bytes belong to which values.

[% figure slug="data-table-packed-storage" img="figures/packed-storage.svg" alt="Packing objects for storage" caption="Storing object values as bits with lookup information." %]

To store a column-major table we will fill an `ArrayBuffer` with:

1.  Two integers that hold the table's size (number of rows and number of columns).

1.  A string with the column labels joined by newline characters.
    (We use newlines as a separator because we assume column labels can't contain them.)

1.  The numbers themselves.

[% excerpt file="packed-cols.js" keep="binary" %]
[% excerpt file="packed-cols-10000-30.out" %]

Packing the data table saves time
because copying bits is faster than turning numbers into characters,
but it doesn't save as much space as expected.
The reason is that double-precision numbers are 8 bytes long,
but because we have chosen simple integer values for our tests,
they can be represented by just 5 characters (which is 10 bytes).
If we had "real" numbers the storage benefit would probably be more pronounced;
once again,
the result of our experiment depends on the test cases we choose.

> ### Engineering
>
> If science is the use of the experimental method to investigate the world,
> engineering is the use of the experimental method
> to investigate and improve the things that people build.
> Good software designers collect and analyze data all the time
> to find out whether one website design works better than another [% b Kohavi2020 %]
> or to improve the performance of CPUs [% b Patterson2017 %];
> a few simple experiments like these can sometimes save weeks or months of effort.

## Exercises {#data-table-exercises}

### Varying filter behavior {.exercise}

How does our decision about which storage format is better change
if we keep 1% of rows when filtering instead of one third?
What if we keep 90% of rows?

### Filtering by strings {.exercise}

Modify the comparison of filter and select to work with tables
that contain columns of strings instead of columns of numbers
and see how that changes performance.
For testing,
creating random 4-letter strings using the characters A-Z
and then filter by:

-   an exact match,
-   strings starting with a specific character, and
-   strings that contain a specific character

### Join performance {.exercise}

A join combines data from two tables based on matching keys.
For example,
if the two tables are:

| Key | Left |
| --- | ---- |
| A   | a1   |
| B   | b1   |
| C   | c1   |

<!-- continue -->
and:

| Key | Right |
| --- | ----- |
| A   | a2    |
| A   | a3    |
| B   | b2    |

<!-- continue -->
then the join is:

| Key | Left | Right |
| --- | ---- | ----- |
| A   | a1   | a2    |
| A   | a1   | a3    |
| B   | b1   | b2    |

Write a test to compare the performance of row-wise vs. column-wise storage
when joining two tables based on matching numeric keys.
Does the answer depend on the fraction of keys that match?

### Join optimization {.exercise}

The simplest way to [% g join %]join[% /g %] two tables is
to look for matching keys using a double loop.
An alternative is to build an [% g index_database %]index[% /g %] for each table
and then use it to construct matches.
For example, suppose the tables are:

| Key | Left |
| --- | ---- |
| A   | a1   |
| B   | b1   |
| C   | c1   |

<!-- continue -->
and:

| Key | Right |
| --- | ----- |
| A   | a2    |
| A   | a3    |
| B   | b2    |

The first step is to create a `Map` showing where each key is found in the first table:

```js
{A: [0], B: [1], C: [2]}
```

<!-- continue -->
The second step is to create a similar `Map` for the second table:

```js
{A: [0, 1], B: [2]}
```

<!-- continue -->
We can then loop over the keys in one of the maps,
look up values in the second map,
and construct all of the matches.

Write a function that joins two tables this way.
Is it faster or slower than using a double loop?
How does the answer depend on the number of keys and the fraction that match?

### Flipping storage {.exercise}

Our tests showed that storing row-oriented tables as JSON
is much slower than storing column-oriented tables.
Write a test to determine whether converting a row-oriented table to a column-oriented table
and then saving the latter
is faster than saving the row-oriented table directly.

### Sparse storage {.exercise}

A [% g sparse_matrix %]sparse matrix[% /g %] is one in which most of the values are zero.
Instead of storing them all,
a program can use a map to store non-zero values
and a lookup function to return zero for anything that isn't stored explicitly:

```js
def spareMatrixGet(matrix, row, col) => {
  return matrix.contains(row, col)
    ? matrix.get(row, col)
    : 0
}
```

The same technique can be used if most of the entries in a data table are missing.
Write a function that creates a sparse table in which a random 5% of the values are non-zero
and the other 95% are zero,
then compare the memory requirements and performance of filter and select for this implementation
versus those of row-wise and column-wise storage.

### Loading time {.exercise}

Modify the programs in this section to measure the time required to convert a data table from JSON or binary form
back to a data structure.

### Saving fixed-width strings {.exercise}

To improve performance,
databases often store [% g fixed_width_string %]fixed-width[% /g %] strings,
i.e.,
they limit the length of the strings in a column to some fixed size
and [% g pad_string %]pad[% /g %] strings that are shorter than that.

1.  Write a function that takes an array of strings and an integer with
    and creates an `ArrayBuffer` containing the strings padded to that width.
    The function should throw an exception if any of the strings
    are longer than the specified width.

2.  Write another function that takes an `ArrayBuffer` as input
    and returns an array of strings.
    This function should remove the padding
    so that strings shorter than the fixed width are restored to their original form.

### Saving variable-width strings {.exercise}

[% g fixed_width_string %]Fixed-width[% /g %] storage is inefficient for large blocks of text
such as contracts, novels, and resumés,
since padding every document to the length of the longest will probably waste a lot of space.
An alternative way to store these in binary is to save each entry as a (length, text) pair.

1.  Write a function that takes a list of strings as input
    and returns an `ArrayBuffer` containing (length, text) pairs.

2.  Write another function that takes such an `ArrayBuffer`
    and returns an array containing the original text.

3.  Write tests with Mocha to confirm that your functions work correctly.

### ASCII storage {.exercise}

The original ASCII standard specified
a 7-bit [% g character_encoding %]character encoding[% /g %] for letters commonly used in English,
and many data files still only use characters whose numeric codes are in the range 0--127.

1.  Write a function that takes an array of single-letter strings
    and returns an `ArrayBuffer` that stores them using one byte per character
    if all of the characters will fit into 7 bits,
    and multiple bytes per character if any of the characters require more than 7 bits.

2.  Write another function that takes an `ArrayBuffer` generated by the first function
    and re-creates the array of characters.
    The function must *only* take the `ArrayBuffer` as an argument,
    so the first element of the `ArrayBuffer` should indicate
    how to interpret the rest of its contents.

3.  Write tests with Mocha to check that your functions work correctly.
