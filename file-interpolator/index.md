---
---

-   Many of our examples are too long to show in one block of code
-   Experiment: write a tool that loads a source file with inclusion markers and then loads and interpolates the inclusions
-   Source file has specially-formatted comments containing two fields:
    -   The text to put in the displayed version
    -   The file to include when loading

<%- include('/inc/file.html', {file: 'interpolation-example.js'}) %>

-   Spoiler: we got this to work, then used a different approach that extracted marked sections from a regular JS file
    -   The stumbling block was that code-checking tools like [ESLint][eslint] didn't understand our inclusions
    -   But there are still lessons in how we built it

## How can we evaluate JavaScript dynamically?

-   We want to load a file dynamically just like `require` does
-   But display the comments in our web/print versions rather than the interpolated code
-   Lifecycle of a JavaScript program
    -   Read text
    -   Translate it into runnable instructions
    -   Run those instructions
-   We can do this whenever we want
    -   Reading text is straightforward
    -   Use the `eval` function to translate and run it
-   A security risk
    -   Arbitrary code can do arbitrary things
    -   At the very least, we ought to run it in a <g key="sandbox">sandbox</g>
-   Evaluate an expression

<%- include('/inc/multi.html', {pat: 'eval-two-plus-two.*', fill: 'js out'}) %>

-   A more interesting example
    -   The string is different each time
    -   Uses the variables that are in scope when `eval` is called

<%- include('/inc/multi.html', {pat: 'eval-loop.*', fill: 'js out'}) %>

-   Variables created inside `eval` are local to it

<%- include('/inc/multi.html', {pat: 'eval-local-vars.*', fill: 'js out'}) %>

-   But `eval` can modify variables outside the text
    -   Just like a function can modify global variables

<%- include('/inc/multi.html', {pat: 'eval-global-vars.*', fill: 'js out'}) %>

-   So if we create a structure with a known name, `eval` can modify that

<%- include('/inc/multi.html', {pat: 'eval-global-structure.*', fill: 'js out'}) %>

-   It doesn't matter where the text comes from
-   So we can move the code that does the modifying into `to-be-loaded.js`

<%- include('/inc/file.html', {file: 'to-be-loaded.js'}) %>

-   This doesn't work on its own because `Seen` isn't defined

<%- include('/inc/file.html', {file: 'to-be-loaded.out'}) %>

-   But if we read the file and `eval` the text *after* defining `Seen`, it does what we want

<%- include('/inc/multi.html', {pat: 'does-the-loading.*', fill: 'js sh out'}) %>

## How can we avoid reloading files?

-   Only want to load any single file once
-   So create a <g key="cache">cache</g> using the <g key="singleton_pattern">Singleton</g> pattern
-   Loader

<%- include('/inc/file.html', {file: 'need-simple.js'}) %>

-   File to import
    -   Final expression is the result of `eval`ing it

<%- include('/inc/file.html', {file: 'import-simple.js'}) %>

-   File doing the importing

<%- include('/inc/multi.html', {pat: 'test-simple.*', fill: 'js sh'}) %>

## How can we control where our files are loaded from?

-   Want to control where files are loaded from
-   Give our program a <g key="search_path">search path</g>
    -   Colon-separated list of directories on Unix
    -   Windows uses semi-colons
    -   If module path starts with `./`, load locally
-   These are all conventions
    -   Someone did it this way years ago
    -   (Almost) everyone has imitated it since
    -   But no requirement and no guarantee
-   A more sophisticated cache

<%- include('/inc/file.html', {file: 'need-path.js'}) %>

-   To test, put the files to import in the `modules` subdirectory
    -   We could call the directory anything we want

<%- include('/inc/file.html', {file: 'modules/imported-left.js'}) %>

-   Put the file doing the importing in current directory

<%- include('/inc/file.html', {file: 'test-import-left.js'}) %>

-   Set path when running Node
    -   `NAME=value command` defines the variable `NAME` just long enough for `command` to run
    -   Shell variables being in UPPER CASE is another convention

<%- include('/inc/multi.html', {pat: 'test-import-left.*', fill: 'sh out'}) %>

-   Now create a second importable file

<%- include('/inc/file.html', {file: 'modules/imported-right.js'}) %>

-   Load that twice to check that caching works

<%- include('/inc/multi.html', {pat: 'test-import-right.*', fill: 'js out'}) %>

## How can we interpolate pieces of code?

-   Now add interpolation
    -   To keep things simple, we will only interpolate snippets in the same directory as the main file
-   Modify `Cache.find` to return a directory and a file path
    -   Add `interpolate` to replace special comments

<%- include('/inc/file.html', {file: 'caching.js'}) %>

-   Can then have a file like:

<%- include('/inc/file.html', {file: 'import-interpolate.js'}) %>

-   And subfiles like this:

<%- include('/inc/file.html', {file: 'import-interpolate-topmethod.js'}) %>

-   And this:

<%- include('/inc/file.html', {file: 'import-interpolate-bottommethod.js'}) %>

-   Test it

<%- include('/inc/multi.html', {pat: 'test-import-interpolate.*', fill: 'sh out'}) %>

-   Lifecycle
    -   Node starts to run `test-import-interpolate.js`
    -   Sees `require('./need-interpolate')` so it reads and evaluates that code
    -   Which creates a singleton cache object
    -   Calls `need('./import-interpolate.js')` (our replacement for `require`)
    -   Checks the cache: nope, nothing there
    -   Loads `import-interpolate.js`
    -   Finds two specially-formatted comments
    -   Loads the file described by each and inserts the text in place of the comment
    -   Uses `eval` on the resulting text
    -   Stores the result of `eval` (which is a class) in the cache
    -   Returns that class
    -   We create an instance and call its method
-   But is this a good idea?
    -   Not really: standard style-checking tools complain about fragments
    -   And we'd have to modify our page template system to show things correctly
    -   No tool exists in isolation
