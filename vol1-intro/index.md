---
---

The best way to learn design in any field is to study examples <cite>Schon1984,Petre2016</cite>,
and some of the best examples of software design come from
the tools programmers use in their own work.
In these lessons we build small versions of things like file backup systems,
testing frameworks,
regular expression matchers,
and browser layout engines
both to demystify them
and to give some insights into how experienced programmers think.
We draw inspiration from <cite>Brown2011,Brown2012,Brown2016</cite>,
[Mary Rose Cook][cook-mary-rose]'s [Gitlet][gitlet],
and the trilogy of books that introduced the Unix philosophy to an entire generation of programmers
<cite>Kernighan1979,Kernighan1988,Kernighan1983</cite>.

All of the written material in this project can be freely reused
under the terms of the [Creative Commons - Attribution license][cc-by],
while all of the software is made available under the terms of
the [Hippocratic License][hippocratic-license];
see <x key="license"></x> for details.

::: centered
*All proceeds from this project will go to support the [Red Door Family Shelter][red-door].*
:::

## Who is our audience?

Every lesson should be written with specific learners in mind.
These three [personas][t3-personas] describe ours:

-   Aïsha started writing VB macros for Excel in an accounting course and never looked back.
    After spending three years doing front-end JavaScript work
    she now wants to learn how to build back-end applications.
    This material will fill in some gaps in her programming knowledge
    and teach her some common design patterns.

-   Rupinder is studying computer science at college.
    He has learned a lot about the theory of algorithms,
    and while he uses Git and unit testing tools in his assignments,
    he doesn't feel he understands how they work.
    This material will give him a better understanding of those tools
    and of how to design new ones.

-   Yim builds mobile apps for a living
    but also teaches two college courses:
    one on full-stack web development using JavaScript and [Node][nodejs]
    and another titled "Software Design".
    They are happy with the former,
    but frustrated that so many books about the latter subject talk about it in the abstract
    and use examples that their students can't relate to.
    This material will fill those gaps
    and give them starting points for a wide variety of course assignments.

Like these three personas, readers should be able to:

-   Write JavaScript programs using loops, arrays, functions, and classes.

-   Create static web pages using HTML and CSS.

-   Install [Node][nodejs] on their computer
    and run programs with it from the command line.

-   Use [Git][git] to save and share files.
    (It's OK not to know [the more obscure commands][git-man-page-generator].)

-   Explain what a tree is and how to process one recursively.
    (This is the most complicated data structure and algorithm we *don't* explain.)

## What tools do we cover?

Programmers have invented [a lot of tools][programming-tools] to make their lives easier.
This volume focuses on a few that individual developers use while writing software;
we hope [the second volume][stjs-v2]
will explore those used in the applications that programmers build.

<div class="html-only">
<%- include('/inc/contents.html') %>
</div>

## What ideas do we cover?

<x key="gloss"></x> defines the terms we introduce in these lessons,
which in turn define the scope of our lessons:

-   How to process a program like any other piece of text.

-   How to turn a program into a data structure that can be analyzed and modified.

-   What design patterns are and which ones are used most often.

-   How programs are executed and how we can control and inspect their execution.

-   How we can analyze programs' performance in order to make sensible design tradeoffs.

-   How to find and run code modules on the fly.

## How are these lessons laid out?

We display JavaScript source code like this:

```js
for (const thing in collection) {
  console.log(thing)
}
```

::: continue
and Unix shell commands like this:
:::

```sh
for filename in *.dat
do
    cut -d , -f 10 $filename
done
```

::: continue
Data and output are shown in italics:
:::

```txt
Package,Releases
0,1
0-0,0
0-0-1,1
00print-lol,2
00smalinux,0
01changer,0
```

We occasionally wrap lines in source code in unnatural ways to make listings fit the printed page,
and sometimes use `...` to show where lines have been omitted.
Where we need to break lines of output for the same reason,
we end all but the last line with a single backslash `\`.
The full listings are all available in [our Git repository][stjs-repo]
and [on our website][stjs-v1].

Finally,
we write functions as `functionName` rather than `functionName()`;
the latter is more common,
but people don't use `objectName{}` for objects or `arrayName[]` for arrays,
and the empty parentheses makes it hard to tell
whether we're talking about "the function itself" or "a call to the function with no parameters".

## How did we get here?

In the early 2000s,
the University of Toronto asked [Greg Wilson][wilson-greg]
to teach an undergraduate course on software architecture.
After delivering the course three times he told the university they should cancel it:
between them,
the dozen textbooks he had purchased with the phrase "software architecture" in their titles
devoted a total of less than 30 pages to describing the designs of actual systems.

Frustrated by that,
he and [Andy Oram][oram-andy] persuaded some well-known programmers to contribute a chapter each
to a collection called *Beautiful Code* <cite>Oram2007</cite>,
which went on to win the Jolt Award in 2007.
Entries in the book described everything from figuring out whether three points are on a line
to core components of Linux
and the software for the Mars Rover,
but the breadth that made them fun to read
also meant they weren't particularly useful for teaching.

To fix that,
Greg Wilson, [Amy Brown][brown-amy], Tavish Armstrong, and Mike DiBernardo
edited a four-book series between 2011 and 2016 called *[The Architecture of Open Source Applications][aosa]*.
In the first two volumes,
the creators of fifty open source projects described their systems' designs;
the third book explored the performance of those systems,
while in the fourth volume contributors built scale models of common tools
as a way of demonstrating how those tools worked.
These books were closer to what an instructor would need for an undergraduate class on software design,
but still not quite right:
the intended audience would probably not be familiar with many of the problem domains,
and since each author used the programming language of their choice,
much of the code would be hard to understand.

*Software Tools in JavaScript* is meant to address these shortcomings:
all of the code is written in one language,
and the examples are all tools that programmers use daily.
Most of the programs are less than 60 lines long and the longest is less than 200;
we believe each chapter can be covered in class in 1-2 hours,
while the exercises range in difficulty from a few minutes to a couple of days.

## How can people contribute?

If you would like to improve what we have or add new material,
please see the Code of Conduct in <x key="conduct"></x>
and the contributor guidelines in <x key="contributing"></x>.
If you have questions or would like to use this material in a course,
please [send us email][email].

## Who helped us and inspired us?

This book is dedicated to [Brian Kernighan][kernighan-brian], who taught us all how to write about software.

We are very grateful for feedback from [Darren McElligott][mcelligott-darren]
and [Evan Schultz][schultz-evan],
and to the creators of [EJS][ejs],
[Emacs][emacs],
[ESLint][eslint],
[Glosario][glosario],
[GNU Make][gnu-make],
[LaTeX][latex],
[Node][nodejs],
[NPM][npm],
[Standard JS][standard-js],
[SVG Screenshot][svg-screenshot],
[WAVE][webaim-wave],
and all the other open source tools we used in creating these lessons.
