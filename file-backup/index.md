---
---

Now that we can test software we have something worth saving.
A <span g="version_control_system" i="version control system">version control system</span>
like <span i="Git; version control system!Git">[Git][git]</span>
keeps track of changes to files
so that we can recover old versions if we want to.
Its heart is a way to archive files that:

1.  records which versions of which files existed at the same time
    (so that we can go back to a consistent previous state), and

1.  stores any particular version of a file only once,
    so that we don't waste disk space.

In this chapter we will build a tool for doing both tasks.
It won't do everything Git does:
in particular, it won't let us create and merge branches.
If you would like to know how that works,
please see <span i="Cook, Mary Rose">[Mary Rose Cook's][cook-mary-rose]</span> excellent [Gitlet][gitlet] project.

## How can we uniquely identify files?

To avoid storing redundant copies of files,
we need a way to tell when two files contain the same data.
We can't rely on names because files can be renamed or moved over time;
we could compare the files byte by byte,
but a quicker way is to use a <span g="hash_function" i="hash function">hash function</span>
that turns arbitrary data into a fixed-length string of bits
(<span f="file-backup-hash-function"/>).

{% include figure
   id='file-backup-hash-function'
   img='figures/hash-function.svg'
   alt='Hash functions'
   cap='How hash functions speed up lookup.' %}

A hash function always produces the same <span g="hash_code" i="hash code">hash code</span> for a given input.
A <span g="cryptographic_hash_function" i="cryptographic hash function; hash function!cryptographic">cryptographic hash function</span>
has two extra properties:

1.  The output depends on the entire input:
    changing even a single byte results in a different hash code.

1.  The outputs look like random numbers:
    they are unpredictable and evenly distributed
    (i.e., the odds of getting any specific hash code are the same)

It's easy to write a bad hash function,
but very hard to write one that qualifies as cryptographic.
We will therefore use a library to calculate 160-bit <span g="sha_1" i="hash code!SHA-1; SHA-1 hash code">SHA-1</span> hashes for our files.
These are not random enough to keep data secret from a patient, well-funded attacker,
but that's not what we're using them for:
we just want hashes that are random to make <span g="collision" i="hash function!collision; collision (in hashing)">collision</span> extremely unlikely.

<div class="callout" markdown="1">

### The Birthday Problem

The odds that two people share a birthday are 1/365 (ignoring February 29).
The odds that they *don't* are therefore 364/365.
When we add a third person,
the odds that they don't share a birthday with either of the preceding two people are 363/365,
so the overall odds that nobody shares a birthday are (365/365)×(364/365)×(363/365).
If we keep calculating, there's a 50% chance of two people sharing a birthday in a group of just 23 people,
and a 99.9% chance with 70 people.

We can use the same math to calculate how many files we need to hash before there's a 50% chance of a collision.
Instead of 365 we use $$2^{160}$$ (the number of values that are 160 bits long),
and after checking [Wikipedia][wikipedia-birthday-problem]
and doing a few calculations with <span i="Wolfram Alpha">[Wolfram Alpha][wolfram-alpha]</span>,
we calculate that we would need to have approximately $$10^{24}$$ files
in order to have a 50% chance of a collision.
We're willing to take that risk…

</div>

[Node's][nodejs] [`crypto`][node-crypto] module provides tools to create a SHA-1 hash.
To use them,
we create an object that keeps track of the current state of the hashing calculations,
tell it how we want to encode (or represent) the hash value,
and then feed it some bytes.
When we are done,
we call its `.end` method
and then use its `.read` method to get the final result:

{% include multi pat='hash-text.*' fill='js sh out' %}

Hashing a file instead of a fixed string is straightforward:
we just read the file's contents and pass those characters to the hashing object:

{% include multi pat='hash-file.*' fill='js sh out' %}

However,
it is more efficient to process the file as a <span g="stream">stream</span>:

{% include multi pat='hash-stream.*' fill='js sh out' %}

{: .continue}
This kind of interface is called
a <span g="streaming_api" i="streaming API; execution!streaming">streaming</span> <span g="api">API</span>
because it is designed to process a stream of data one chunk at a time
rather than requiring all of the data to be in memory at once.
Many applications use streams
so that programs don't have to read entire (possibly large) files into memory.

To start,
this program asks the `fs` library to create a reading stream for a file
and to <span g="pipe">pipe</span> the data from that stream to the hashing object
(<span f="file-backup-streaming"/>).
It then tells the hashing object what to do when there is no more data
by providing a <span g="handler" i="event handler!streaming API; streaming API!event handler">handler</span> for the "finish" event.
This is called asynchronously:
as the output shows,
the main program ends before the task handling the end of data is scheduled and run.
Most programs also provide a handler for "data" events to do something with each block of data as it comes in;
the `hash` object in our program does that for us.

{% include figure
   id='file-backup-streaming'
   img='figures/streaming.svg'
   alt='Streaming file operations'
   cap='Processing files as streams of chunks.' %}

## How can we back up files?

Many files only change occasionally after they're created, or not at all.
It would be wasteful for a version control system to make copies
each time the user wanted to save a snapshot of a project,
so instead our tool will copy each unique file to something like `abcd1234.bck`,
where `abcd1234` is a hash of the file's contents.
It will then store a data structure that records the filenames and hash keys for each snapshot.
The hash keys tell it which unique files are part of the snapshot,
while the filenames tell us what each file's contents were called when the snapshot was made
(since files can be moved or renamed).
To restore a particular snapshot,
all we have to do is copy the saved `.bck` files back to where they were
(<span f="file-backup-storage"/>).

{% include figure
   id='file-backup-storage'
   img='figures/storage.svg'
   alt='Backup file storage'
   cap='Organization of backup file storage.' %}

We can build the tools we need to do this uses promises (<span x="async-programming"/>).
The main function creates a promise that uses the asynchronous version of `glob` to find files
and then:

1.  checks that entries in the list are actually files;

1.  reads each file into memory; and

1.  calculates hashes for those files.

{% include keep file='hash-existing-promise.js' key='main' %}

{: .continue}
This function uses `Promise.all`
to wait for the operations on all of the files in the list to complete
before going on to the next step.
A different design would combine stat, read, and hash into a single step
so that each file would be handled independently
and use one `Promise.all` at the end to bring them all together.

The first two <span i="helper function">helper functions</span> that `hashExisting` relies on
wrap asynchronous operation in promises:

{% include keep file='hash-existing-promise.js' key='helpers' %}

The final helper function calculates the hash synchronously,
but we can use `Promise.all` to wait on those operations finishing anyway:

{% include keep file='hash-existing-promise.js' key='hashPath' %}

Let's try running it:

{% include multi pat='run-hash-existing-promise.*' fill='js sh slice.out' %}

The code we have written is clearer than it would be with callbacks
(try rewriting it if you don't believe this)
but the layer of promises around everything still obscures its meaning.
The same operations are easier to read when written using `async` and `await`:

{% include keep file='hash-existing-async.js' key='main' %}

{: .continue}
This version creates and resolves exactly the same promises as the previous one,
but those promises are created for us automatically by Node.
To check that it works,
let's run it for the same input files:

{% include multi pat='run-hash-existing-async.*' fill='js sh slice.out' %}

## How can we track which files have already been backed up?

The second part of our backup tool keeps track of which files have and haven't been backed up already.
It stores backups in a directory that contains backup files like `abcd1234.bck`
and files describing the contents of particular snapshots.
The latter are named `ssssssssss.csv`,
where `ssssssssss` is the <span g="utc">UTC</span> <span g="timestamp">timestamp</span> of the backup's creation
and the `.csv` extension indicates that the file is formatted as <span g="csv">comma-separated values</span>.
(We could store these files as <span g="json">JSON</span>, but CSV is easier for people to read.)

<div class="callout" markdown="1">

### Time of check/time of use

Our naming convention for index files will fail if we try to create more than one backup per second.
This might seem very unlikely,
but many faults and security holes are the result of programmers assuming things weren't going to happen.

We could try to avoid this problem by using a two-part naming scheme `ssssssss-a.csv`,
`ssssssss-b.csv`, and so on,
but this leads to a <span g="race_condition" i="race condition">race condition</span>
called <span g="toctou" i="race condition!time of check/time of use; time of check/time of use">time of check/time of use</span>.
If two users run the backup tool at the same time,
they will both see that there isn't a file (yet) with the current timestamp,
so they will both try to create the first one.

</div>

{% include file file='check-existing-files.js' %}

To test our program,
let's manually create testing directories with manufactured (shortened) hashes:

{% include multi pat='tree-test.*' fill='sh out' %}

We use <span i="Mocha">[Mocha][mocha]</span> to manage our tests.
Every test is an `async` function;
Mocha automatically waits for them all to complete before reporting results.
To run them,
we add the line:

```js
"test": "mocha */test/test-*.js"
```

{: .continue}
in the `scripts` section of our project's `package.json` file
so that when we run `npm run test`,
Mocha looks for files in `test` sub-directories of the directories holding our lessons.

Here are our first few tests:

{% include file file='test/test-find.js' %}

{: .continue}
and here is Mocha's report:

{% include file file='test-check-filesystem.out' %}

## How can we test code that modifies files?

The final thing our tool needs to do
is copy the files that need copying and create a new index file.
The code itself will be relatively simple,
but testing will be complicated by the fact
that our tests will need to create directories and files before they run
and then delete them afterward
(so that they don't contaminate subsequent tests).

A better approach is to use a <span g="mock_object" i="mock object!for testing; unit test!using mock object">mock object</span>
instead of the real filesystem.
A mock object has the same interface as the function, object, class, or library that it replaces,
but is designed to be used solely for testing.
Node's [`mock-fs`][node-mock-fs] library provides the same functions as the `fs` library,
but stores everything in memory
(<span f="file-backup-mock-fs"/>).
This prevents our tests from accidentally disturbing the filesystem,
and also makes tests much faster
(since in-memory operations are thousands of times faster than operations that touch the disk).

{% include figure
   id='file-backup-mock-fs'
   img='figures/mock-fs.svg'
   alt='Mock filesystem'
   cap='Using a mock filesystem to simplify testing.' %}

We can create a mock filesystem by giving the library a JSON description of
the files and what they should contain:

{% include erase file='test/test-find-mock.js' key='tests' %}

{: .continue}
<span i="Mocha!beforeEach">Mocha</span> automatically calls `beforeEach` before running each tests,
and <span i="Mocha!afterEach">`afterEach`</span> after each tests completes
(which is yet another <span i="protocol!for unit testing">protocol</span>).
All of the tests stay exactly the same,
and since `mock-fs` replaces the functions in the standard `fs` library with its own,
nothing in our application needs to change either.

We are finally ready to write the program that actually backs up files:

{% include file file='backup.js' %}

The tests for this are more complicated than tests we have written previously
because we want to check with actual file hashes.
Let's set up some fixtures to run tests on:

{% include keep file='test/test-backup.js' key='fixtures' %}

{: .continue}
and then run some tests:

{% include keep file='test/test-backup.js' key='tests' %}
{% include file file='test-backup.out' %}

<div class="callout" markdown="1">

## Design for test

One of the best ways---maybe *the* best way---to evaluate software design
is by thinking about <span i="testability!as design criterion; software design!testability">testability</span> <cite>Feathers2004</cite>.
We were able to use a mock filesystem instead of a real one
because the filesystem has a well-defined API
that is provided to us in a single library,
so replacing it is a matter of changing one thing in one place.
If you have to change several parts of your code in order to test it,
the code is telling you to consolidate those parts into one component.

</div>
