---
---

Every program needs documentation in order to be usable,
and the best place to put that documentation is on the web.
Writing and updating pages by hand is time-consuming and error-prone,
particularly when so many of their parts are the same,
so most websites use some kind of tool to create HTML from templates.

Thousands of page templating systems have been written in the last thirty years
in every popular programming language
(and in fact one language, [PHP][php], was created for this purpose).
Most of these systems use one of three designs
(<f key="page-templates-options"></f>):

1.  Mix commands in a language such as JavaScript with the HTML or Markdown
    using some kind of marker to indicate which parts are commands
    and which parts are to be taken as-is.
    This approach is taken by [EJS][ejs],
    which we have used to write these lessons.

2.  Create a mini-language with its own commands like [Jekyll][jekyll]
    (the templating system used by [GitHub Pages][github-pages]).
    Mini-languages are appealing because they are smaller and safer than general-purpose languages,
    but experience shows that they quickly grow many of the features
    of a general-purpose language.
    Again, some kind of marker must be used to show
    which parts of the page are code and which are ordinary text.

3.  Use specially-named attributes in the HTML.
    This approach has been the least popular,
    but eliminates the need for a special parser
    (since pages are valid HTML).

<%- include('/inc/fig.html', {
    id: 'page-templates-options',
    img: '/static/tools-small.jpg',
    alt: 'Three options for page templates',
    cap: 'Three different ways to implement page templating.',
    fixme: true
}) %>

In this chapter we will build a simple page templating system using the third option.
We will process each page independently by parsing the HTML
and walking the <g key="dom">DOM</g> to find nodes with special attributes.
Our program will execute the instructions in those nodes
to do the equivalent of loops and if/else statements;
other nodes will be copied as-is to create text.

## What will our system look like?

Let's start by deciding what "done" looks like.
Suppose we want to turn an array of strings into an HTML list.
Our page will look like this:

<%- include('/inc/html.html', {file: 'input-loop.html'}) %>

::: continue
The attribute `q-loop` tells the tool to repeat that node;
the loop variable and the collection being looped over
are the attribute's value, separated by a colon.
The attribute `q-var` tells the tool to fill in the node with the value of the variable.
The output will look like HTML without any traces of how it was created:
:::

<%- include('/inc/html.html', {file: 'output-loop.html'}) %>

::: callout
### Human-readable vs. machine-readable

The introduction said that mini-languages for page templating
quickly start to accumulate extra features.
We have already started down that road
by putting the loop variable and loop target in a single attribute
and parsing that attribute to get them out.
Doing that makes loop elements easier for people to type,
but means that important information is hidden from standard HTML processing tools,
which can't know that this particular attribute of these particular elements
contains multiple values
or that those values should be extracted by splitting a string on a colon.
We could instead require people to use two attributes, as in:

```html
    <ul q-loop="names" q-loop-var="item">
```
:::

What about processing templates?
Our tool needs the template itself,
somewhere to write its output,
and some variables to use in the expansion.
These variables might come from a configuration file,
from a <g key="yaml">YAML</g> header in the file itself,
or from some mix of the two;
for the moment,
all we need to know is that
we wil pass them into the expansion function as an object:

<%- include('/inc/file.html', {file: 'example-call.js'}) %>

## How can we keep track of values?

Speaking of variables,
we need a way to keep track of their current values:
"current", because the value of a loop variable changes each time we go around the loop.
We also need to maintain multiple sets of variables
so that we can nest loops.

The standard solution is to create a stack of lookup tables.
Each <g key="stack_frame">stack frame</g> is an object with names and values;
when we need to find a variable,
we look through the stack frames in order to find the uppermost definition of that variable..

::: callout
### Scoping rules

Searching the stack frame by frame is called is <g key="dynamic_scoping">dynamic scoping</g>,
since we find variables while the program is running.
In contrast,
most programming languages used <g key="lexical_scoping">lexical scoping</g>,
which figures out what a variable name refers to based on the structure of the program text.
:::

The values in a running program are sometimes called an <g key="environment">environment</g>,
so we have named our stack-handling class `Env`.
Its methods let us push and pop new stack frames
and find a variable given its name;
if the variable can't be found,
`Env.find` returns `undefined` instead of throwing an exception
(<f key="page-templates-stack"></f>).

<%- include('/inc/file.html', {file: 'env.js'}) %>

<%- include('/inc/fig.html', {
    id: 'page-templates-stack',
    img: '/static/tools-small.jpg',
    alt: 'Variable stack',
    cap: 'Using a stack to manage variables.',
    fixme: true
}) %>

## How do we handle nodes?

HTML pages have a nested structure,
so we will process them using the <g key="visitor_pattern">Visitor pattern</g>.
`Visitor`'s constructor takes the root node of the DOM tree as an argument and saves it.
When we call `Visitor.walk` without a value,
it starts recursing from that saved root;
if `.walk` is given a value (as it is during recursive calls),
it uses that instead.

<%- include('/inc/file.html', {file: 'visitor.js'}) %>

::: continue
`Visitor` defines two methods called `open` and `close` that are called
when we first arrive at a node and when we are finished with it
(<f key="page-templates-visitor"></f>).
The default implementations throw exceptions
so that the creators of derived classes must remember to implement their own versions.
:::

<%- include('/inc/fig.html', {
    id: 'page-templates-visitor',
    img: '/static/tools-small.jpg',
    alt: 'The Visitor pattern',
    cap: 'Using the Visitor pattern to evaluate a page template.',
    fixme: true
}) %>

The `Expander` class is a `Visitor` and uses an `Env`.
It loads a handler for each type of special node we support---we will write these in a moment---and
uses them to process each type of node:

1.  If the node is plain text, copy it to the output.

2.  If there is a handler for the node, call the handler's `open` or `close` method.

3.  Otherwise, open or close a regular tag.

<%- include('/inc/erase.html', {file: 'expander.js', key: 'skip'}) %>

Checking to see if there is a handler for a particular node
and getting that handler are straightforward:

<%- include('/inc/keep.html', {file: 'expander.js', key: 'handlers'}) %>

Finally, we need a few helper methods to show tags and generate output:

<%- include('/inc/keep.html', {file: 'expander.js', key: 'helpers'}) %>

::: continue
Notice that this class adds strings to an array and then joins them all right at the end
rather than concatenating strings repeatedly.
Doing this is more efficient and also helps with debugging,
since each string in the array corresponds to a single method call.
:::

## How do we implement node handlers?

So far we have built a lot of infrastructure but haven't actually processed a single special node.
To do that,
let's start with a handler that copies a constant number into the output:

<%- include('/inc/file.html', {file: 'q-num.js'}) %>

::: continue
When we enter a node like `<span q-num="123"/>`,
this handler prints an opening tag
and then copies the value of the `q-num` attribute to the output.
When we are exiting the node,
the handler closes the tag.
:::

Note that this is *not* a class,
but instead an object with two functions stored under the keys `open` and `close`.
We could (and probably should) use a class for each handler
so that handlers can store any extra state they need,
but <g key="bare_object">bare objects</g> are still often used in JavaScript.

So much for constants; what about variables?

<%- include('/inc/file.html', {file: 'q-var.js'}) %>

::: continue
This code is almost the same as the previous example;
the only difference is that instead of copying the attribute value directly to the output,
we use the attribute value as a key to look up a value in the environment.
:::

These two pairs of handlers look plausible, but do they work?
To find out,
we can build a program that loads variable definitions from a JSON file,
reads an HTML template,
and does the expansion:

<%- include('/inc/file.html', {file: 'template.js'}) %>

As we were writing this chapter,
we added new variables for our test cases one by one.
To avoid repeating text repeatedly,
we show the entire set once:

<%- include('/inc/file.html', {file: 'vars.json'}) %>

Our first test:
is static text copied over as-is?

<%- include('/inc/html.html', {file: 'input-static-text.html'}) %>
<%- include('/inc/file.html', {file: 'static-text.sh'}) %>
<%- include('/inc/html.html', {file: 'output-static-text.html'}) %>
<%- include('/inc/page.html', {file: 'output-static-text.html'}) %>

Good.
Now, does the expander handle constants?

<%- include('/inc/html.html', {file: 'input-single-constant.html'}) %>
<%- include('/inc/html.html', {file: 'output-single-constant.html'}) %>
<%- include('/inc/page.html', {file: 'output-single-constant.html'}) %>

What about a single variable?

<%- include('/inc/html.html', {file: 'input-single-variable.html'}) %>
<%- include('/inc/html.html', {file: 'output-single-variable.html'}) %>
<%- include('/inc/page.html', {file: 'output-single-variable.html'}) %>

What about a page containing multiple variables?
There's no reason it should fail if the single-variable case works,
but variable lookup is one of the more complicated parts of our processing,
so we should check:

<%- include('/inc/html.html', {file: 'input-multiple-variables.html'}) %>
<%- include('/inc/html.html', {file: 'output-multiple-variables.html'}) %>
<%- include('/inc/page.html', {file: 'output-multiple-variables.html'}) %>

## How can we implement control flow?

Our tool supports two types of control flow:
conditional expressions and loops.
Since we don't support <g key="boolean">Boolean</g> expressions like `and` and `or`,
implementing a conditional is as simple as looking up a variable
(which we know how to do)
and then expanding the node if the value is true:

<%- include('/inc/file.html', {file: 'q-if.js'}) %>

Let's test it:

<%- include('/inc/html.html', {file: 'input-conditional.html'}) %>
<%- include('/inc/html.html', {file: 'output-conditional.html'}) %>
<%- include('/inc/page.html', {file: 'output-conditional.html'}) %>

And finally we come to loops.
For these,
we need to get the array we're looping over from the environment
and do something once for each of its elements.
That "something" is:

1.  Create a new stack frame holding the current value of the loop variable.

2.  Expand all of the node's children with that stack frame in place.

3.  Pop the stack frame to get rid of the temporary variable.

<%- include('/inc/file.html', {file: 'q-loop.js'}) %>

Once again,
it's not done until we test it:

<%- include('/inc/html.html', {file: 'input-loop.html'}) %>
<%- include('/inc/html.html', {file: 'output-loop.html'}) %>
<%- include('/inc/page.html', {file: 'output-loop.html'}) %>

Notice how we create the new stack frame using:

```js
{ [indexName]: index }
```

::: continue
This is an ugly but useful trick.
We can't write:
:::

```js
{ indexName: index }
```

:::continue
because that would create an object with the string `indexName` as a key,
rather than one with the value of the variable `indexName` as its key.
We can't do this either:
:::

```js
{ `${indexName}`: index }
```

::: continue
though it seems like we should be able to.
Instead,
we create an array containing the string we want.
JavaScript automatically converts arrays to strings by concatenating their elements when it needs to,
so our expression is a quick way to get the same effect as:
:::

```js
const temp = {}
temp[indexName] = index
expander.env.push(temp)
```

## How did we know how to do all of this?

We have just implemented a simple programming language.
It can't do arithmetic,
but if we wanted to add tags like:

```js
<span q-math="+"><span q-var="width"/><span q-num="1"/></span>
```

::: continue
we could.
It's unlikely anyone would use the result---typing all of that
is so much clumsier than typing `width+1` that people wouldn't use it
unless they had no other choice---but the basic design is there.
:::

We didn't invent any of this from scratch,
any more than we invented the parsing algorithm of <x key="regex-parser"></x>.
Instead,
we did what you are doing now:
we read what other programmers had written
and tried to make sense of the key ideas.
