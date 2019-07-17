---
permalink: "/"
title: "Software Tools in JavaScript"
---

The best way to learn software design is by example,
and the best examples are the tools that developers use themselves.
This project draws inspiration from
{% include cite.md keys="brown2011,brown2012,brown2016" %},
[Gitlet][gitlet],
[various][browser-tutorial] [tutorials][db-tutorial],
and most of all from
the trilogy that introduced the Unix philosophy to an entire generation of programmers
{% include cite.md keys="kernighan1979,kernighan1988,kernighan1983" %}

All contributors must abide by our [Code of Conduct](./conduct/)
and all decisions will be made by consensus using [Martha's Rules](./contributing/).
Please see the [our contributors' guidelines]({{'/contributing/' | relative_url}}) for details
and for a description of our development process and formatting rules.
All royalties from sales of this book will be donated to [Bridge][bridge],
which provides free training and professional development by industry experts
to women, non-binary, and agender tech workers.

## Audience {#audience}

-   Aïsha started writing VB macros for Excel in an accounting course and never looked back.
    She has spent the last three years doing front-end JavaScript work
    and now wants to learn how to build back-end applications.
    This material will teach her some common design patterns
    and how to think about tradeoffs when architecting complex systems.

-   Rupinder did a bachelor's degree in computer science,
    during which he was taught a lot more about algorithmic complexity than about building software.
    He uses Git and React on a daily basis,
    but is often frustrated by their apparent unpredictability.
    This material will give him a better understanding of tools like version control systems,
    unit testing tools,
    and web frameworks
    so that he can use them more effectively.

-   Yim teaches software engineering at a four-year college.
    Their courses include one on web development using JavaScript and Node
    and another on software design.
    They are frustrated that so many books talk about software architecture in the abstract,
    and about systems that their students can't relate to.
    This material will fill those gaps
    and give them starting points for a wide variety of course assignments.

## Topics {#topics}

{% include topics.html %}

## Layout {#layout}

We display JavaScript source code like this:

```js
for (const thing in collection) {
  console.log(thing)
}
```

and Unix shell commands like this:
{: class="noindent"}

```sh
for filename in *.dat
do
    cut -d , -f 10 $filename
done
```

Data and output are shown in italics:
{: class="noindent"}

```text
Package,Releases
0,1
0-0,0
0-0-1,1
00print-lol,2
00smalinux,0
01changer,0
```

## Dedication {#dedication}

*For Brian Kernighan, who taught us all how to write (about) software.*

{% include links.md %}
