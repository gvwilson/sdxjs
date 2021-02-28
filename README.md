# Software Tools in JavaScript

The best way to learn design in any field is to study examples,
and some of the best examples of software design come from the tools programmers use in their own work.
These lessons build small versions of things like file backup systems,
testing frameworks,
regular expression matchers,
and browser layout engines
both to demystify them and
to give some insights into how experienced programmers think.
Please see [the description of our audience](https://stjs.tech/vol1/#who-is-our-audience)
for more information about what we assume you already know.

-   All of the written material in this project can be freely reused
    under the terms of the [Creative Commons - Attribution license](https://stjs.tech/license/#writing),
    while all of the software is made available under the terms of the [Hippocratic License](https://stjs.tech/license/#software).

-   E-books and printed copies will be available by mid-2021.
    All proceeds from sales will go to supported the [Red Door Family Shelter](https://www.reddoorshelter.ca/) in Toronto.

-   Please see [the contributors' guide](https://stjs.tech/contributing/)
    and our [Code of Conduct](https://stjs.tech/conduct/)
    if you would like to help improve or extend this work.
    Anyone who provides minor fixes or feedback will be added to
    [the acknowledgments](https://stjs.tech/#who-helped-us-and-inspired-us);
    anyone who writes a chapter will be added to [the authors' list](https://stjs.tech/authors/).

## FAQ

-   **Is this done yet?**
    No: what we have now is the first complete draft,
    but we think it's in a reviewable state.

-   **Why did you start this project?**
    Because most books with the words "software design" or "software architecture" in their titles
    spend most of their pages telling readers how to describe a design,
    but don't actually describe the designs of real systems.
    *[Beautiful Code](https://www.oreilly.com/library/view/beautiful-code/9780596510046/)*
    and *[The Architecture of Open Source Applications](http://aosabook.org)*
    were intended to fill this gap,
    but were too wide-ranging to be useful as textbooks.
    We hope that using one language (modern command-line JavaScript with [Node.js](https://nodejs.org/))
    and one problem domain (software engineering tools)
    will make this book more approachable to junior programmers.

-   **How long did it take you to write this?**
    An average of four or five hours a week over two years.
    The code and point-form notes came first;
    once that had settled down,
    it only took an hour a day for five weeks to turn the notes into prose
    and draw the diagrams.

-   **Why JavaScript?**
    1.  Forty years ago, [Donald Knuth](https://en.wikipedia.org/wiki/Donald_Knuth) said that
        Pascal was every programmer's second language.
        The same is now true of JavaScript:
        it's the one language that every developer needs to know a little of.
    2.  We hope there will be a second volume
        that will show readers how the components of a modern web stack work.
        JavaScript is the only realistic choice for the front-end tools that will be part of that.
    3.  We wanted to learn more JavaScript than
        co-authoring *[JavaScript for Data Science](https://js4ds.org/)* taught us.

-   **What about doing a Python or TypeScript version? Or a Spanish one?**
    Translations into other languages (both human and machine) would be very welcome:
    please [get in touch](mailto:gvwilson@third-bit.com) if you're interested.

-   **I'm teaching a programming class: can I use this, and if so, how?**
    1.  The answer to the first part is "yes please".
        All of this material is covered by [an open license](https://stjs.tech/license/),
        so as long as you acknowledge the original source (e.g., by providing a link back),
        you can use it in whole or in part,
        as-is or with modification.
    2.  "How" depends on what you're teaching.
        This material isn't suitable for a first course on programming or on JavaScript,
        but should provide lots of material for an undergraduate course on software design or software engineering
        at the third- or fourth-year level.
        Students can tackle the exercises at the end of each chapter
        or write and explain small tools of their own
        like [fuzz testers](https://en.wikipedia.org/wiki/Fuzzing) as course-length projects.
        They can also try using more formal tools like [statecharts](https://statecharts.github.io/),
        [Alloy](https://alloytools.org/),
        or [TLA+](https://lamport.azurewebsites.net/tla/tla.html)
        to analyze and improve the tools that already exist.

-   **Do you want a chapter on X?**
    Possibly:
    as we said above,
    we would like the second volume to show people how to build things like
    a simple relational database or document database,
    an HTTP server,
    a basic authentication and identity management package,
    an issue tracker,
    and so on.
    If you are interested, please [get in touch](mailto:gvwilson@third-bit.com).

-   **Why do you translate Markdown and HTML to LaTeX yourself? Why not use [Pandoc](https://pandoc.org/)?**
    Our experience with Pandoc in several previous projects was that
    customizing its output and maintaining those customizations was more work than doing the translation ourselves.
    (And we apologize for our dependence on LaTeX for generating PDFs:
    it is hard to set up and even harder to debug things that go wrong,
    but there is no realistic alternative.)
