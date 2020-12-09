---
---

The best way to learn software design is by example,
and the best examples are the tools developers use themselves.
This project draws inspiration from <cite>Brown2011,Brown2012,Brown2016</cite>,
[Mary Rose Cook][cook-mary-rose]'s [Gitlet][gitlet],
and the trilogy that introduced the Unix philosophy to an entire generation of programmers
<cite>Kernighan1979,Kernighan1988,Kernighan1983</cite>.
All of the written material in this project is free to use
under the terms of the [Creative Commons - Attribution license][cc-by],
while all of the software is made available under the terms of
the [Hippocratic License][hippocratic-license];
see <xref key="license"></xref> for details.

::: centered
*All proceeds from this project will go to the [Red Door Family Shelter][red-door].*
:::

## Audience

Every lesson should be written with specific learners in mind.
These [learner personas][t3-personas] define ours:

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

Programmers have invented [a lot of tools][programming-tools] to make their lives easier.
This volume focuses on the ones that individual developers use while writing software;
we hope that the second volume will explore those that go into the applications programmers build.

<div class="html-only">
<%- include('/inc/contents.html') %>
</div>

## Layout

We display JavaScript source code like this:

```js
for (const thing in collection) {
  console.log(thing)
}
```

::: unindented
and Unix shell commands like this:
:::

```sh
for filename in *.dat
do
    cut -d , -f 10 $filename
done
```

::: unindented
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

We occasionally wrap lines in source code just to make listings fit on the page.
Where we need to break lines of output for the same reason,
we end all but the last line with a single backslash `\`.
Note that we typeset functions as `functionName` rather than `functionName()`;
the latter is more common,
but (a) people don't use `objectName{}` or `arrayName[]`
and (b) it could mean "the function object" or "a call to the function with no parameters",
and that ambiguity is confusing when we're passing functions to one another.

## Acknowledgments

We are very grateful for for feedback from [Darren McElligott][mcelligott-darren]
and [Evan Schultz][schultz-evan].

## Dedication

::: centered
*For Brian Kernighan, who taught us all how to write about software.*
:::
