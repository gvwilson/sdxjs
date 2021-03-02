---
---

Many programmers believe they're more likely to write documentation and keep it up to date
if it is close to the code.
Tools that extract specially-formatted comments from code and turn them into documentation
have been around since at least the 1980s;
many are used for JavaScript,
including [JSDoc][jsdoc] and [ESDoc][esdoc].
This chapter will use what we learned in <span x="code-generator"></span> about parsing source code
to build a simple documentation generator of our own.

## How can we extract documentation comments?

We will use [Acorn][acorn] once again to parse our source files.
This time we will use the parser's `onComment` option,
giving it an array to fill in.
For the moment we won't bother to assign the AST produced by parsing to a variable
because we are just interested in the comments:

{% include file file='extract-comments.js' %}

{% include multi pat='two-kinds-of-comment.*' fill='js out' %}

There is more information here than we need,
so let's slim down the JSON that we extract:

{% include file file='extract-comments-subset.js' %}

{% include multi pat='two-kinds-of-comment-subset.*' fill='sh out' %}

{% include figure id='doc-generator-comments' img='figures/comments.svg' alt='Line and block comments' cap='How line comments and block comments are distinguished and represented.' %}

Acorn distinguishes two kinds of comments (<span f="doc-generator-comments"></span>).
<span g="line_comment">Line comments</span> cannot span multiple lines;
if one line comment occurs immediately after another,
Acorn reports two comments:

{% include multi pat='multi-line-double-slash-comment.*' fill='js sh out' %}

<span g="block_comment">Block comments</span>,
on the other hand,
can span any number of lines.
We don't need to prefix each line with `*` but most people do for readability:

{% include multi pat='multi-line-slash-star-comment.*' fill='js sh out' %}

By convention,
we use block comments that start with `/**` for documentation.
The first two characters are recognized by the parser as "start of comment",
so the first character in the extracted text is `*`:

{% include multi pat='doc-comment.*' fill='js out' %}

## What input will we try to handle?

We will use [Markdown][markdown] for formatting our documentation.
The <span g="doc_comment">doc comments</span> for function definitions look like this:

{% include file file='example-plain.js' %}

{: .continue}
while the ones for class definitions look like this:

{% include file file='util-plain.js' %}

The doc comments are unpleasant at the moment:
they repeat the function and method names from the code,
we have to create titles ourselves,
and we have to remember the back-quotes for formatting code.
We will fix some of these problems once we have a basic tool up and running.

The next step in doing that is to translate Markdown into HTML.
There are many Markdown parsers in JavaScript;
after experimenting with a few,
we decided to use [`markdown-it`][markdown-it]
along with the [`markdown-it-anchor`][markdown-it-anchor] extension
that creates HTML anchors for headings.
The main program gets all the doc comments from all of the input files,
converts the Markdown to HTML,
and displays that:

{% include keep file='process-plain.js' key='main' %}

To get all the comments
we extract comments from all the files,
remove the leading `*` characters (which aren't part of the documentation),
and then join the results after stripping off extraneous blanks:

{% include keep file='process-plain.js' key='getAllComments' %}

Extracting the comments from a single file is done as before:

{% include keep file='process-plain.js' key='extractComments' %}

{: .continue}
and removing the prefix `*` characters is a matter of splitting the text into lines,
removing the leading spaces and asterisks,
and putting the lines back together:

{% include keep file='process-plain.js' key='removePrefix' %}

One thing that isn't in this file (because we're going to use it in later versions)
is the function `slugify`.
A <span g="slug">slug</span> is a short string that identifies a header or a web page;
the name comes from the era of newspapers,
where a slug was a short name used to identify an article while it was in production.
Our `slugify` function strips unnecessary characters out of a title,
adds hyphens,
and generally makes it something you might see in a URL:

{% include file file='slugify.js' %}

Let's run the first version of our documentation generator
and see what it produces
(<span f="doc-generator-mapping"></span>):

{% include file file='process-plain.sh' %}
{% include file file='process-plain.html' %}

{% include figure id='doc-generator-process-plain' img='figures/process-plain.svg' alt='Output of documentation generator' cap='The page produced by the documentation generator.' %}

{% include figure id='doc-generator-mapping' img='figures/mapping.svg' alt='Mapping comments to documentation' cap='How comments in code map to documentation in HTML.' %}

It works,
but there is a double `h1` header for each file (the filename and and the title comment),
the anchor IDs are hard to read,
there are no cross-references,
and so on.
Some of the visual issues can be resolved with CSS,
and we can change our input format to make processing easier
as long as it also makes authoring easier.
However,
anything that is written twice will eventually be wrong in one place or another,
so our first priority is to remove duplication.

## How can we avoid duplicating names?

If a comment is the first thing in a file,
we want to use it as title text;
this will save us having to write an explicit level-1 title in a comment.
For each other comment,
we can extract the name of the function or method
from the node on the line immediately following the doc comment.
This allows us to write much tidier comments:

{% include file file='find-following-input.js' %}

To extract and display information from nodes immediately following doc comments
we must find all the block comments,
record the last line of each,
and then search the AST to find nodes that are on lines
immediately following any of those trailing comment lines.
(We will assume for now that there are no blank lines between the comment
and the start of the class or function.)
The main program finds the comments as usual,
creates a set containing the line numbers we are looking for,
then searches for the nodes we want:

{% include keep file='find-following.js' key='main' %}

The recursive search is straightforward as well---we delete line numbers from the target set
and add nodes to the <span g="accumulator">accumulator</span> as we find matches:

{% include keep file='find-following.js' key='findFollowing' %}

Finally,
we use a function called `condense` to get the name we want out of the AST we have:

{% include keep file='find-following.js' key='condense' %}

{: .continue}
We need this because we get a different structure with:

```js
const name = function() => {
}
```

{: .continue}
than we get with:

```js
function name() {
}
```

When we run this on our test case we get:

{% include file file='find-following.out' %}

We can use this to create better output (<span f="doc-generator-fill-in-headers"></span>):

{% include file file='fill-in-headers.js' %}
{% include file file='fill-in-headers.html' %}

{% include figure id='doc-generator-fill-in-headers' img='figures/fill-in-headers.svg' alt='Filling in headers' cap='Filling in headers when generating documentation.' %}

<div class="callout" markdown="1">

### Code is data

We haven't made this point explicitly in a while,
so we will repeat it here:
code is just another kind of data,
and we can process it just like we would process any other data.
Parsing code to produce an AST is no different from parsing HTML to produce DOM;
in both cases we are simply transforming a textual representation that's easy for people to author
into a data structure that's easy for a program to manipulate.
Pulling things out of that data to create a report
is no different from pulling numbers out of a hospital database to report monthly vaccination rates.

Treating code as data enables us to do routine programming tasks with a single command,
which in turn gives us more time to think about the tasks that we can't (yet) automate.
Doing this is the foundation of a tool-based approach to software engineering;
as the mathematician Alfred North Whitehead once wrote,
"Civilization advances by extending the number of important operations which we can perform without thinking about them."

</div>
