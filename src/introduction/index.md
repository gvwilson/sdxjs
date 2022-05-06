---
template: page
title: "Introduction"
lede: "Who you are and where we're going"
---

The best way to learn design is to study examples [% b Schon1984 Petre2016 %],
and some of the best examples of software design come from
the tools programmers use in their own work.
In these lessons we build small versions of things like file backup systems,
testing frameworks,
regular expression matchers,
and browser layout engines
both to demystify them
and to give some insights into how experienced programmers think.
We draw inspiration from [% b Brown2011 Brown2012 Brown2016 %],
[Mary Rose Cook's][cook-mary-rose] [Gitlet][gitlet],
and the books that introduced the Unix philosophy to an entire generation of programmers
[% b Kernighan1979 Kernighan1981 Kernighan1983 Kernighan1988 %].

All of the written material in this project can be freely reused
under the terms of the [Creative Commons - Attribution - NonCommercial license][cc-by-nc],
while all of the software is made available under the terms of
the [Hippocratic License][hippocratic-license];
see [% x license %] for details.

*All proceeds from this project will go to support the [Red Door Family Shelter][red-door].*

## Who is our audience? {: #introduction-audience}

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
    one on full-stack web development using JavaScript and Node
    and another titled "Software Design".
    They are happy with the former,
    but frustrated that so many books about the latter subject talk about it in the abstract
    and use examples that their students can't relate to.
    This material will fill those gaps
    and give them starting points for a wide variety of course assignments.

Like these three personas, readers should be able to:

-   Write JavaScript programs using loops, arrays, functions, and classes.

-   Create static web pages using HTML and CSS.

-   Install Node on their computer
    and run programs with it from the command line.

-   Use [Git][git] to save and share files.
    (It's OK not to know [the more obscure commands][git-man-page-generator].)

-   Explain what a tree is and how to process one recursively.
    (This is the most complicated data structure and algorithm we *don't* explain.)

This book can be read on its own or as a companion to *[Building Software Together][bst]*,
which is a guide for students who are about to embark on their first large software project in a team.
If you are looking for a project to do in a course,
adding a tool to those covered here would be fun as well as educational.
Please see [% x conclusion %] for more details.

## What tools and ideas do we cover? {: #introduction-contents}

Programmers have invented [a lot of tools][programming-tools] to make their lives easier.
This volume focuses on a few that individual developers use while writing software;
we hope future volumes
will explore those used in the applications that programmers build.

[% x glossary %] defines the terms we introduce in these lessons,
which in turn define the scope of our lessons:

-   How to process a program like any other piece of text.

-   How to turn a program into a data structure that can be analyzed and modified.

-   What design patterns are and which ones are used most often.

-   How programs are executed and how we can control and inspect their execution.

-   How we can analyze programs' performance in order to make sensible design tradeoffs.

-   How to find and run code modules on the fly.

## How are these lessons laid out? {: #introduction-layout}

We display JavaScript source code like this:

```js
for (const thing in collection) {
  console.log(thing)
}
```

<!-- continue -->
and Unix shell commands like this:

```sh
for filename in *.dat
do
    cut -d , -f 10 $filename
done
```

<!-- continue -->
Data and output are shown in italics:

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
and [on our website][stjs].

Finally,
we write functions as `functionName` rather than `functionName()`;
the latter is more common,
but people don't use `objectName{}` for objects or `arrayName[]` for arrays,
and the empty parentheses makes it hard to tell
whether we're talking about "the function itself" or "a call to the function with no parameters".

## How did we get here? {: #introduction-history}

In the early 2000s,
the [% i "University of Toronto" %]University of Toronto[% /i %] asked [% i "Wilson, Greg" %][Greg Wilson][wilson-greg][% /i %]
to teach an undergraduate course on software architecture.
After delivering the course three times he told the university they should cancel it:
between them,
the dozen textbooks he had purchased with the phrase "software architecture" in their titles
devoted a total of less than 30 pages to describing the designs of actual systems.

Frustrated by that,
he and [% i "Oram, Andy" %][Andy Oram][oram-andy][% /i %] persuaded some well-known programmers to contribute a chapter each
to a collection called *Beautiful Code* [% b Oram2007 %],
which went on to win the Jolt Award in 2007.
Entries in the book described everything from figuring out whether three points are on a line
to core components of Linux
and the software for the Mars Rover,
but the breadth that made them fun to read
also meant they weren't particularly useful for teaching.

To fix that,
Greg Wilson, [% i "Brown, Amy" %][Amy Brown][brown-amy][% /i %],
[% i "Armstrong, Tavish" %][Tavish Armstrong][armstrong-tavish][% /i %],
and [% i "DiBernardo, Mike" %][Mike DiBernardo][dibernardo-mike][% /i %]
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

## How can people use and contribute to this material? {: #introduction-use}

All of the written material on this site is made available under the Creative
Commons - Attribution - NonCommercial 4.0 International license (CC-BY-NC-4.0),
while the software is made available under the Hippocratic License.  The first
allows you to use and remix this material for non-commercial purposes, as-is or
in adapted form, provided you cite its original source; the second allows you to
use and remix the software on this site provided you do not violate
international agreements governing human rights. Please see [% x license %]
for details.

If you would like to improve what we have or add new material, please see the
Code of Conduct in [% x conduct %] and the contributor guidelines in
[% x contributing %].  If you have questions or would like to use this material in
a course, please file an issue in
this site's GitHub repository <!-- FIXME -->
or send us email. <!-- FIXME -->

## Who helped us and inspired us? {: #introduction-help}

This book is dedicated to [% i "Kernighan, Brian" %][Brian Kernighan][kernighan-brian][% /i %],
who taught us all how to write about software.
I am grateful to the creators of [Emacs][emacs],
[ESLint][eslint],
[Glosario][glosario],
[GNU Make][gnu-make],
[LaTeX][latex],
[Node][nodejs],
[NPM][npm],
[Standard JS][standard-js],
[SVG Screenshot][svg-screenshot],
[WAVE][webaim-wave],
and all the other open source tools we used in creating these lessons:
if we all give a little,
we all get a lot.
I would also like to thank Darren McElligott and Evan Schultz
for their reviews and feedback;
any errors, omissions, or misunderstandings that remain are entirely my fault.
