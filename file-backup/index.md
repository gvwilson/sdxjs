---
---

-   Goal: archiving files with an index that identifies each version so that we don't store redundant data
-   The basis of [Git][git]

## What is a hash code and how can we create one for a file?

-   A <g key="hash_function">hash function</g> turns arbitrary data into a fixed-length string of bits
    -   That bit string can then be used to place the object in a predictable place in a table
    -   Gives reasonably fast lookup for arbitrary keys
-   A <g key="cryptographic_hash_function">cryptographic hash function</g> produces keys that appear random
    -   Leads to the fastest possible lookup on average
-   Easy to write a bad hash function but hard to write a strong one
    -   Use a library to calculate a 160-bit [SHA-1] hash
    -   Not strong enough to deter a well-funded attacker, but that's not what we're using it for

<%- include('/inc/multi.html', {pat: 'hash-text.*', fill: 'js sh text'}) %>

-   The hash code for a file:
    -   Will always be the same for the same content
    -   Is almost certain to be different if even a single byte differs

<%- include('/inc/multi.html', {pat: 'hash-file.*', fill: 'js sh text'}) %>

> **The Birthday Problem**
>
> The odds that two people share a birthday are 1/365 (ignoring February 29).
> The odds that they *don't* are therefore 364/365.
> When we add a third person,
> the odds that they don't share a birthday with either of the preceding two people are 363/365,
> so the overall odds that nobody shares a birthday are (365/365)×(364/365)×(363/365).
> If we keep calculating, there's a 50% chance of two people sharing a birthday in a group of just 23 people,
> and a 99.9% chance with 70 people.
>
> We can use the same math to calculate how many files we need to hash before there's a 50% chance of a collision.
> Instead of 365, we use 2<sup>160</sup> (the number of values that are 160 bits long),
> and quickly get into "if every atom in the universe was a file there still wouldn't be collisions" territory.

-   More efficient to process the file as a <g key="stream">stream</g>
    -   Read the file in chunks
    -   Pass each chunk to an object containing a hashing function, which accumulates a result
    -   Tell the hashing object what to do when the stream finishes
    -   Another example of [asynchronous execution](#asynchronous)

<%- include('/inc/multi.html', {pat: 'hash-stream.*', fill: 'js sh text'}) %>

-   Many files don't change after they're created, or only change very slowly
-   Wasteful to copy them every time a backup is done
-   Instead:
    -   Copy each file to something like `abcd1234.bck` where `abcd1234` is a hash of the file's contents
    -   Store a data structure that records filenames and hash keys at a particular instant
    -   To restore from a particular date, copy saved files to where they need to be

## How can async and await simplify code?

-   Step 1: find all files and calculate their hashes

<%- include('/inc/code.html', {file: 'hash-existing-promise.js'}) %>

<%- include('/inc/multi.html', {pat: 'run-hash-existing-promise.*', fill: 'js sh text'}) %>

-   This code is clearer than it would be with callbacks…
-   …but the layer of promises around everything still obscures meaning
-   Modern JavaScript provides `async` and `await` keywords
    -   `async` means "this function implicitly returns a promise"
    -   `await` means "wait for a promise to resolve"
-   Doing all the same things as the explicit promise-based version, but easier to read
    -   In particular, allows us to mix asynchronous and synchronous code (`hashPath` doesn't delay computation)

<%- include('/inc/code.html', {file: 'hash-existing-async.js'}) %>

<%- include('/inc/multi.html', {pat: 'run-hash-existing-async.*', fill: 'js sh text'}) %>

## How can we test JavaScript?

-   Step 2: see which files have and haven't been backed up already
    -   Backup directory contains `abcd1234.bck` (backup files) and `ssssssssss.csv` (manifest files),
        where `ssssssssss` is the [UTC](#utc) [timestamp](#timestamp) of the backup's creation
    -   We assume no more than one backup per second (which is unsafe in practice)

<%- include('/inc/code.html', {file: 'check-existing-files.js'}) %>

-   Manually create testing directories with manufactured (shortened) hashes

<%- include('/inc/multi.html', {pat: 'tree-test.*', fill: 'sh text'}) %>

-   Use [Mocha][mocha] for testing
    -   All tests are written using `async`
    -   Mocha will automatically wait for them to complete before reporting results
    -   Add `"test": "mocha */test/test-*.js"` to the `scripts` key of `package.json`,
        since we may add tests for other things later

<%- include('/inc/code.html', {file: 'test/test-find.js'}) %>
<%- include('/inc/multi.html', {pat: 'test-check-filesystem.*', fill: 'sh text'}) %>

## How can we test code that modifies files?

-   Step 3: copy the files that need copying and create a new timestamped [CSV](#csv) file
    -   Could use JSON, but CSV is easier for humans to read
-   The code itself will be relatively simple, but setup and cleanup will be annoying
-   Better solution: use a <g key="mock_object">mock object</g> instead of the real filesystem
    -   Has the same interface as the real function/object/class/library
    -   But works differently for testing purposes
-   Install [`mock-fs`][node-mock-fs]
-   Create a mock filesystem with a JSON description of files and their contents
-   Repeat previous tests using mock
    -   Results stay the same

<%- include('/inc/code.html', {file: 'test/test-find-mock.js'}) %>

-   Now write the code that does the file copying

<%- include('/inc/code.html', {file: 'backup.js'}) %>

-   And some tests
    -   Which are quite involved, since we want to check with actual file hashes

<%- include('/inc/code.html', {file: 'test/test-backup.js'}) %>
<%- include('/inc/multi.html', {pat: 'test-backup.*', fill: 'sh text'}) %>
