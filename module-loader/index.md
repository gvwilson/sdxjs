---
---

-   Our files are getting too long to show in one block
-   Write a tool that a text file with inclusion markers and turns it into loaded code
-   Source file has markers with text to put in displayed version and file to include when loading:

{% include file.md file="interpolation-example.js" %}

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
    -   Ought to run it in a [sandbox][sandbox]
-   Evaluate an expression

{% include wildcard.md pattern="eval-01.*" values="js,text" %}

-   A more interesting example

{% include wildcard.md pattern="eval-02.*" values="js,text" %}

-   Variables created inside `eval` are local to it

{% include wildcard.md pattern="eval-03.*" values="js,text" %}

-   But `eval` can modify variables (just like a function can modify globals)

{% include wildcard.md pattern="eval-04.*" values="js,text" %}

-   If we create a structure with a known name, `eval` can modify that

{% include wildcard.md pattern="eval-05.*" values="js,text" %}

-   It doesn't matter where the text comes from
-   Move the code that does the modifying into `to-be-loaded.js`

{% include file.md file="to-be-loaded.js" %}

-   Read the file and `eval` the text for its side effects

{% include wildcard.md pattern="does-the-loading.*" values="js,sh,text" %}

## How can we avoid reloading files? {#avoid-reloading}

-   Only want to load any single file once
-   So create a [cache][cache] using the [Singleton][singleton-pattern] pattern
-   Loader

{% include file.md file="need-01.js" %}

-   File to import
    -   Final expression is the result of `eval`ing it

{% include file.md file="import-01.js" %}

-   File doing the importing

{% include wildcard.md pattern="test-01.*" values="js,sh" %}

-   Want to control where files are loaded from
-   Give our program a [search path][search-path]
    -   Colon-separated list of directories
-   If module path starts with `./`, load locally

{% include file.md file="need-02.js" %}

-   File to import in `modules` subdirectory

{% include file.md file="modules-02/import-02-a.js" %}

-   File doing the importing in current directory

{% include file.md file="test-02-a.js" %}

-   Set path when running Node

{% include wildcard.md pattern="test-02-a.*" values="sh,text" %}

-   Now create a second importable file

{% include file.md file="modules-02/import-02-b.js" %}

-   And load that

{% include wildcard.md pattern="test-02-b.*" values="js,sh,text" %}

-   And finally test re-importing

{% include wildcard.md pattern="test-02-c.*" values="js,sh,text" %}

## How can we interpolate pieces of code? {#interpolating}

-   Now add interpolation
    -   `Cache.find` returns a directory and a file path (only interpolate from same directory)
    -   Add `interpolate` to replace special comments

{% include file.md file='caching.js' %}

-   Can then have a file like:

{% include file.md file="import-03-c.js" %}

-   And subfiles like this:

{% include file.md file="import-03-c-topmethod.js" %}

-   But the included file is displayed in Jekyll like this

{% include interpolate.md file="import-03-c.js" %}

-   However, there's a problem: what if we import from `..` (as we do in testing?
-   Solution:
    -   Find the directory of the file making the inclusion
    -   Extract the directory from the path
    -   Create a path for the included file from it
    -   This would be a great place to use a side-by-side display of changes...

{% include file.md file="need-04.js" %}

{% include links.md %}
