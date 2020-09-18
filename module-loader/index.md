---
---

-   Our files are getting too long to show in one block
-   Write a tool that a text file with inclusion markers and turns it into loaded code
-   Source file has markers with text to put in displayed version and file to include when loading:

<%- include('/_inc/code.html', {file: 'interpolation-example.js'}) %>

## How can we evaluate JavaScript dynamically? {#dynamic-evaluation}

-   Want to be able to load this dynamically just like `require`
    -   And display it in web page with the comments rather than the interpolated code
-   Lifecycle of a JavaScript program
    -   Read text
    -   Translate it into runnable instructions
    -   Run those instructions
-   We can do this whenever we want
    -   Reading text is straightforward
    -   Use the `eval` function to translate and run it
-   Very dangerous
    -   Code may do arbitrary things
    -   Ought to run it in a <g key="sandbox">sandbox</g>
-   Evaluate an expression

<%- include('/_inc/multi.html', {pat: 'eval-01.*', fill: 'js text'}) %>

-   A more interesting example

<%- include('/_inc/multi.html', {pat: 'eval-02.*', fill: 'js text'}) %>

-   Variables created inside `eval` are local to it

<%- include('/_inc/multi.html', {pat: 'eval-03.*', fill: 'js text'}) %>

-   But `eval` can modify variables (just like a function can modify globals)

<%- include('/_inc/multi.html', {pat: 'eval-04.*', fill: 'js text'}) %>

-   If we create a structure with a known name, `eval` can modify that

<%- include('/_inc/multi.html', {pat: 'eval-05.*', fill: 'js text'}) %>

-   It doesn't matter where the text comes from
-   Move the code that does the modifying into `to-be-loaded.js`

<%- include('/_inc/code.html', {file: 'to-be-loaded.js'}) %>

-   Read the file and `eval` the text for its side effects

<%- include('/_inc/multi.html', {pat: 'does-the-loading.*', fill: 'js sh text'}) %>

## How can we avoid reloading files? {#avoid-reloading}

-   Only want to load any single file once
-   So create a <g key="cache">cache</g> using the <g key="singleton_pattern">Singleton</g> pattern
-   Loader

<%- include('/_inc/code.html', {file: 'need-01.js'}) %>

-   File to import
    -   Final expression is the result of `eval`ing it

<%- include('/_inc/code.html', {file: 'import-01.js'}) %>

-   File doing the importing

<%- include('/_inc/multi.html', {pat: 'test-01.*', fill: 'js sh'}) %>

-   Want to control where files are loaded from
-   Give our program a <g key="search_path">search path</g>
    -   Colon-separated list of directories
-   If module path starts with `./`, load locally

<%- include('/_inc/code.html', {file: 'need-02.js'}) %>

-   File to import in `modules` subdirectory

<%- include('/_inc/code.html', {file: 'modules-02/import-02-a.js'}) %>

-   File doing the importing in current directory

<%- include('/_inc/code.html', {file: 'test-02-a.js'}) %>

-   Set path when running Node

<%- include('/_inc/multi.html', {pat: 'test-02-a.*', fill: 'sh text'}) %>

-   Now create a second importable file

<%- include('/_inc/code.html', {file: 'modules-02/import-02-b.js'}) %>

-   And load that

<%- include('/_inc/multi.html', {pat: 'test-02-b.*', fill: 'js sh text'}) %>

-   And finally test re-importing

<%- include('/_inc/multi.html', {pat: 'test-02-c.*', fill: 'js sh text'}) %>

## How can we interpolate pieces of code? {#interpolating}

-   Now add interpolation
    -   `Cache.find` returns a directory and a file path (only interpolate from same directory)
    -   Add `interpolate` to replace special comments

<%- include('/_inc/code.html', {file: 'caching.js'}) %>

-   Can then have a file like:

<%- include('/_inc/code.html', {file: 'import-03-c.js'}) %>

-   And subfiles like this:

<%- include('/_inc/code.html', {file: 'import-03-c-topmethod.js'}) %>

-   But the included file is displayed in Jekyll like this

<%- include('/_inc/code.html', {file: 'import-03-c.js'}) %>

-   However, there's a problem: what if we import from `..` (as we do in testing?
-   Solution:
    -   Find the directory of the file making the inclusion
    -   Extract the directory from the path
    -   Create a path for the included file from it
    -   This would be a great place to use a side-by-side display of changes...

<%- include('/_inc/code.html', {file: 'need-04.js'}) %>
