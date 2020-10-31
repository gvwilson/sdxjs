---
---

The best way to learn software design is by example,
and the best examples are the tools that developers use themselves.
This project draws inspiration from <cite>Brown2011,Brown2012,Brown2016</cite>,
[Gitlet][gitlet],
[various][browser-tutorial] [tutorials][db-tutorial],
and most of all from
the trilogy that introduced the Unix philosophy to an entire generation of programmers
<cite>Kernighan1979,Kernighan1988,Kernighan1983</cite>.

All of the written material in this project is free to use
under the terms of the [Creative Commons - Attribution license][cc-by],
while all of the software is made available under the terms of
the [Hippocratic License][hippocratic-license];
see <xref key="license"></xref> for details.

*All proceeds from this project will be donated to the [Red Door Family Shelter][red-door].*

## Audience

-   Aïsha started writing VB macros for Excel in an accounting course and never looked back.
    She has spent the last three years doing front-end JavaScript work
    and now wants to learn how to build back-end applications.
    This material will teach her some common design patterns
    and how to think about tradeoffs when architecting complex systems.

-   Rupinder is doing a bachelor's degree in computer science,
    and feels he has learned more about algorithmic complexity than about building software.
    He uses Git and style-checking tools on a daily basis,
    but is often frustrated by their complexity.
    This material will give him a better understanding of tools like this work
    so that he can use them more effectively.

-   Yim teaches software engineering at a four-year college.
    Their courses include one on web development using JavaScript and Node
    and another on software design.
    They are frustrated that so many books talk about software architecture in the abstract,
    and about systems that their students can't relate to.
    This material will fill those gaps
    and give them starting points for a wide variety of course assignments.

## Content

Programmers have invented [a lot of different tools][programming-tools]
to make their lives easier.
Since we don't have space to cover them all,
we have focused on tools that individual developers would use while writing software.
We have therefore left out:

-   front-end frameworks
-   web servers
-   relational databases
-   document-oriented databases
-   object-relational mappers
-   issue trackers
-   continuous integration servers
-   search engines
-   chat and other real-time collaboration tools

They are all interesting,
and we hope readers will enjoy this book enough
to contribute chapters on these topics and others
to a second volume.

::: callout
Debuggers

We think interactive debuggers are as important as version control.
We really wanted to explain how to build one,
but there are so few descriptions of working debuggers to draw on
that we weren't able to make progress.
Again,
we would be very grateful for contributions.
:::

<div class="html-only">
<%- include('/_inc/contents.html') %>
</div>

## Layout

We display JavaScript source code like this:

```js
for (const thing in collection) {
  console.log(thing)
}
```

<p class="noindent">and Unix shell commands like this:</p>

```sh
for filename in *.dat
do
    cut -d , -f 10 $filename
done
```

<p class="noindent">Data and output are shown in italics:</p>

```txt
Package,Releases
0,1
0-0,0
0-0-1,1
00print-lol,2
00smalinux,0
01changer,0
```

We occasionally wrap lines in source code just to make listings fit on the page.
Where we need to break lines of output for the same reason,
we end all but the last line with a single backslash `\`.

## Dedication

*For Brian Kernighan, who taught us all how to write about software.*
