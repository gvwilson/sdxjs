---
---

Now that we can test software,
the next step is to be able to save it.
A <g key="version_control_system">version control system</g> like [Git][git]
keeps track of changes to files
so that we can recover old versions if we want to.
At its core is a system for archiving files in a way that:

1.  records which versions of which files existed at the same time
    (so that we can go back to a consistent previous state), and

1.  stores any particular version of a file only once,
    so that we don't waste disk space.

In this chapter we will build a simple tool for doing both tasks.

## How can we uniquely identify files?

To avoid storing redundant copies of files,
we need a way to tell when two files contain the same data.
We could compare the files byte by byte,
but a quicker way is to use a <g key="hash_function">hash function</g>
that turns arbitrary data into a fixed-length string of bits
(<f key="file-backup-hash-function"></f>).

<%- include('/inc/figure.html', {
    id: 'file-backup-hash-function',
    img: './figures/hash-function.svg',
    alt: 'Hash functions',
    cap: 'How hash functions speed up lookup.'
}) %>

A hash function always produces the same <g key="hash_code">hash code</g> for a given input.
A <g key="cryptographic_hash_function">cryptographic hash function</g> has two extra properties:

1.  The hash codes it produces look like random numbers:
    they are evenly distributed
    (i.e., the odds of getting any specific output value are exactly the same).

1.  The hash code depends on the entire input:
    changing even a single byte results in a different hash code.

It's easy to write a bad hash function,
but very hard to write one that qualifies as cryptographic.
We will therefore use a library to calculate 160-bit [SHA-1][sha_1] hashes for our files.
These are not random enough to keep data secret from a patient, well-funded attacker,
but that's not what we're using them for:
we just want hashes that are random to make <g key="collision">collision</g> extremely unlikely.

::: callout
### The Birthday Problem

The odds that two people share a birthday are 1/365 (ignoring February 29).
The odds that they *don't* are therefore 364/365.
When we add a third person,
the odds that they don't share a birthday with either of the preceding two people are 363/365,
so the overall odds that nobody shares a birthday are (365/365)×(364/365)×(363/365).
If we keep calculating, there's a 50% chance of two people sharing a birthday in a group of just 23 people,
and a 99.9% chance with 70 people.

We can use the same math to calculate how many files we need to hash before there's a 50% chance of a collision.
Instead of 365, we use 2<sup>160</sup> (the number of values that are 160 bits long),
and quickly get into "if every atom in the universe was a file there still wouldn't be collisions" territory.
:::

[Node][nodejs]'s [`crypto`][node-crypto] module provides the functions we need to create a SHA-1 hash.
To do this,
we create an object that keeps track of the current state of the hashing calculations,
tell it how we want to encode (or represent) the hash value,
and then feed it some bytes.
When we are done,
we call its `.end` method
and then use its `.read` method to get the final result:

<%- include('/inc/multi.html', {pat: 'hash-text.*', fill: 'js sh out'}) %>

Given this,
hashing a file is straightforward:
we just read the file and pass its contents to the hashing object:

<%- include('/inc/multi.html', {pat: 'hash-file.*', fill: 'js sh out'}) %>

However,
it is more efficient to process the file as a <g key="stream">stream</g>:

<%- include('/inc/multi.html', {pat: 'hash-stream.*', fill: 'js sh out'}) %>

Many libraries rely on streams
so that programs don't have to read entire (possibly large) files into memory.
To start,
this program asks the `fs` library to create a reading stream for a file
and to <g key="pipe">pipe</g> the data from that stream to the hashing object
(<f key="file-backup-streaming"></f>).
It then tells the hashing object what to do when there is no more data
by providing a <g key="handler">handler</g> for the "finish" event.
This is called asynchronously:
as the output shows,
the main program ends before the task handling the end of data is scheduled and run.
Most programs also provide a handler for "data" events to do something with each block of data as it comes in;
the `hash` object in our program does that for us.

<%- include('/inc/figure.html', {
    id: 'file-backup-streaming',
    img: './figures/streaming.svg',
    alt: 'Streaming file operations',
    cap: 'Processing files as streams of chunks.'
}) %>

## How can we back up files?

Many files don't change after they're created, or only change very slowly.
It would be wasteful for a version control system to copy them all
each time the user wanted to save a snapshot of a project,
so instead our tool will copy each unique file to something like `abcd1234.bck`,
where `abcd1234` is a hash of the file's contents.
It will then store a data structure that records the filenames and hash keys for each snapshot.
The hash keys tell it which unique files are part of the snapshot,
while the filenames tell us what each file's contents were called when the snapshot was made
(since files can be moved or renamed).
To restore a particular snapshot,
all we have to do is copy the saved `.bck` files back to where they were
(<f key="file-backup-storage"></f>).

<%- include('/inc/figure.html', {
    id: 'file-backup-storage',
    img: './figures/storage.svg',
    alt: 'Backup file storage',
    cap: 'Organization of backup file storage.'
}) %>

We can build the tools we need to do this uses promises (<x key="async-programming"></x>).
The main function creates a promise that uses the asynchronous version of `glob` to find files
and then:

1.  checks that entries in the list are actually files;

1.  reads each file into memory; and

1.  calculates hashes for those files.

<%- include('/inc/erase.html', {file: 'hash-existing-promise.js', key: 'helpers'}) %>

::: continue
Notice that this function uses `Promise.all` to wait for the operations on all of the files in the list to complete
before going on to the next step.
A different design would combine stat, read, and hash into a single step
so that each file would be handled independently
and there would be only one `Promise.all` at the end to bring them all together.
:::

The first two helper functions that `hashExisting` relies on
wrap asynchronouss operation in promises:

<%- include('/inc/keep.html', {file: 'hash-existing-promise.js', key: 'helpers'}) %>

The final helper function calculates the hash synchronously,
but we can use `Promise.all` to wait on those operations finishing anyway:

<%- include('/inc/file.html', {file: 'hash-existing-promise.js'}) %>

Let's try running it:

<%- include('/inc/multi.html', {pat: 'run-hash-existing-promise.*', fill: 'js sh slice.out'}) %>

The code we have writen is clearer than it would be with callbacks---if you don't believe this,
try rewriting it---but the layer of promises around everything still obscures its meaning.
Here are the same operations written using `async` and `await`:

<%- include('/inc/file.html', {file: 'hash-existing-async.js'}) %>

::: continue
This version creates and resolves exactly the same promises as the previous one,
but those promises are created for us automatically by [Node][nodejs].
To check that it works,
let's run it for the same input files:
:::

<%- include('/inc/multi.html', {pat: 'run-hash-existing-async.*', fill: 'js sh slice.out'}) %>

## How can we track which files have already been backed up?

The second part of our backup tool keeps track of which files have and haven't been backed up already.
It stores backups in a directory that contains backup files like `abcd1234.bck`
and files describing the contents of particular snapshots.
The latter are named `ssssssssss.csv`,
where `ssssssssss` is the <g key="utc">UTC</g> <g key="timestamp">timestamp</g> of the backup's creation
and the `.csv` extension indicates that the file is formatted as <g key="csv">comma-separated values</g>.
(We could store these files as <g key="json">JSON</g>, but CSV is easier for people to read.)

::: callout
### Time of check/time of use

Our naming convention for index files will fail if we try to create more than one backup per second.
This might seem very unlikely,
but many faults and security holes are the result of programmers assuming things weren't going to happen.

We could try to avoid this problem by using a two-part naming scheme `ssssssss-a.csv`,
`ssssssss-b.csv`, and so on,
but this leads to a <g key="race_condition">race condition</g>
called <g key="toctou">time of check/time of use</g>.
If two users run the backup tool at the same time,
they will both see that there isn't a file (yet) with the current timestamp,
so they will both try to create the first one.
:::

<%- include('/inc/file.html', {file: 'check-existing-files.js'}) %>

To test our program,
let's manually create testing directories with manufactured (shortened) hashes:

<%- include('/inc/multi.html', {pat: 'tree-test.*', fill: 'sh out'}) %>

We use [Mocha][mocha] to manage our tests.
Every test is an `async` function;
Mocha automatically waits for them all to complete before reporting results.
To run them,
we add the line:

```js
"test": "mocha */test/test-*.js"
```

::: continue
in the `scripts` section of our project's `package.json` file
so that when we run `npm run test`,
Mocha looks for files in `test` sub-directories of the directories holding our lessons.
:::

Here are our first few tests:

<%- include('/inc/file.html', {file: 'test/test-find.js'}) %>

::: continue
and here is Mocha's report:
:::

<%- include('/inc/file.html', {file: 'test-check-filesystem.out'}) %>

## How can we test code that modifies files?

The final thing our tool needs to do
is copy the files that need copying and create a new index file.
The code itself will be relatively simple,
but testing will be complicated by the fact
that our tests will need to create directories and files before they run
and then delete them afterward
(so that they don't contaminate subsequent tests).

A better approach is to use a <g key="mock_object">mock object</g>
instead of the real filesystem.
A mock object has the same interface as the function, object, class, or library that it replaces,
but is designed to be used solely for testing.
[Node][nodejs]'s [`mock-fs`][node-mock-fs] library provides the same functions as the `fs` library,
but stores everything in memory
(<f key="file-backup-mock-fs"></f>).
This prevents our tests from accidentally disturbing the filesystem,
and also makes tests much faster
(since in-memory operations are thousands of times faster than operations that touch the actual filesystem).

<%- include('/inc/figure.html', {
    id: 'file-backup-mock-fs',
    img: './figures/mock-fs.svg',
    alt: 'Mock filesystem',
    cap: 'Using a mock filesystem to simplify testing.'
}) %>

We can create a mock filesystem by giving the library a JSON description of
the files and what they should contain:

<%- include('/inc/erase.html', {file: 'test/test-find-mock.js', key: 'tests'}) %>

::: continue
Mocha automatically calls `beforeEach` before running each tests,
and `afterEach` after each tests completes.
All of the tests stay exactly the same,
and since `mock-fs` replaces the functions in the standard `fs` library with its own,
nothing in our application needs to change either.
:::

We are finally ready to write the program that actually backs up files:

<%- include('/inc/file.html', {file: 'backup.js'}) %>

The tests for this are more complicated than tests we have written previously
because we want to check with actual file hashes.
Let's set up some fixtures to run tests on:

<%- include('/inc/keep.html', {file: 'test/test-backup.js', key: 'fixtures'}) %>

::: continue
and then run some tests:
:::

<%- include('/inc/keep.html', {file: 'test/test-backup.js', key: 'tests'}) %>

::: fixme
OK, what did I break?
:::

<%- include('/inc/file.html', {file: 'test-backup.out'}) %>
