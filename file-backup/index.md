---
---

-   Goal: archiving files with a hashed index
-   The basis of [Git][git]

## What is a hash code and how can I create one for a file?

-   A <g key="cryptographic_hash_function">cryptographic hash function</g>:
    -   Turns data of arbitrary size into a fixed-size block of bits
    -   Is 100% reproducible
    -   Cannot be reversed

<%- include('/inc/multi.html', {pat: 'hash-text.*', fill: 'js sh text'}) %>

-   The hash code for a file:
    -   Will always be the same for the same content
    -   Is almost guaranteed to be different if even a single byte differs

<%- include('/inc/multi.html', {pat: 'hash-file.*', fill: 'js sh text'}) %>

-   More efficient to process the file as a <g key="stream">stream</g>

<%- include('/inc/multi.html', {pat: 'hash-stream.*', fill: 'js sh text'}) %>

-   Many files don't change after they're created, or only change very slowly
-   Wasteful to copy them every time a backup is done
-   Instead:
    -   Copy each file to `hash(file)`
    -   Store a data structure that records directories' contents as JSON
    -   To restore from a particular date, copy <g key="blob">blobs</g> to where they need to be

## How can async and await simplify code?

-   Step 1: find all files and calculate their hashes

<%- include('/inc/code.html', {file: 'hash-existing-promise.js'}) %>

<%- include('/inc/multi.html', {pat: 'run-hash-existing-promise.*', fill: 'js sh text'}) %>

-   This code is clearer than it would be with callbacks…
-   …but the layer of promises around everything still obscures meaning
-   Modern JavaScript provides `async` and `await` keywords
    -   `async` means "this function implicitly returns a `Promise`"
    -   `await` means "wait for a promise to resolve"
-   Doing all the same things as the explicit `Promise`-based version, but easier to read

<%- include('/inc/code.html', {file: 'hash-existing-async.js'}) %>

<%- include('/inc/multi.html', {pat: 'run-hash-existing-async.*', fill: 'js sh text'}) %>

## How can we test JavaScript?

-   Step 2: see which files have and haven't been backed up already
    -   Backup directory contains `abcd1234.bck` (backup files) and `ssssssssss.csv` (manifest files)
    -   We assume no more than one backup per second (which will easily be false in practice)

<%- include('/inc/code.html', {file: 'check-existing-files.js'}) %>

-   Create testing directories with manufactured (shortened) hashes

<%- include('/inc/multi.html', {pat: 'tree-test.*', fill: 'sh text'}) %>

-   Use [Mocha][mocha] for testing
    -   Add `"test": "mocha */test/test-*.js"` to the `scripts` key of `package.json`,
        since we may add tests for other things later

<%- include('/inc/code.html', {file: 'test/test-find.js'}) %>
<%- include('/inc/multi.html', {pat: 'test-check-filesystem.*', fill: 'sh text'}) %>

## How can we test code that modifies files?

-   Step 3: copy the files that need copying and create a new timestamped CSV file
-   The code itself will be relatively simple, but setup and cleanup will be annoying
-   Better solution: use a <g key="mock_object">mock object</g> instead of the real filesystem
    -   Has the same interface as the real function/object/class/library
    -   But works differently for testing purposes
-   Install [`mock-fs`][node-mock-fs]
-   Repeat previous tests using mock
    -   Results stay the same

<%- include('/inc/code.html', {file: 'test/test-find-mock.js'}) %>

-   Now write the code that does the file copying

<%- include('/inc/code.html', {file: 'backup.js'}) %>

-   And some tests
    -   Which are quite involved, since we want to check with actual file hashes

<%- include('/inc/code.html', {file: 'test/test-backup.js'}) %>
<%- include('/inc/multi.html', {pat: 'test-backup.*', fill: 'sh text'}) %>
