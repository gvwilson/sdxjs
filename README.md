# Software Design by Example
## A Tool-Based Introduction with JavaScript

The best way to learn design in any field is to study examples,
and some of the best examples of software design come from the tools programmers use in their own work.
These lessons build small versions of things like file backup systems,
testing frameworks,
regular expression matchers,
and browser layout engines
both to demystify them and
to give some insights into how experienced programmers think.
Please see [the description of our audience](https://stjs.tech/#who-is-our-audience)
for more information about what we assume you already know.

-   All of the written material in this project can be freely reused
    under the terms of the [Creative Commons - Attribution license](https://stjs.tech/license/#writing),
    while all of the software is made available under the terms of the [Hippocratic License](https://stjs.tech/license/#software).

-   All proceeds from sales will go to support the [Red Door Family Shelter](https://www.reddoorshelter.ca/) in Toronto.

-   Please see [the contributors' guide](https://stjs.tech/contributing/)
    and our [Code of Conduct](https://stjs.tech/conduct/)
    if you would like to help improve or extend this work.
    Anyone who provides minor fixes or feedback will be added to
    [the acknowledgments](https://stjs.tech/#who-helped-us-and-inspired-us);
    anyone who writes a chapter will be added to [the authors' list](https://stjs.tech/authors/).

Note: this book was originally titled *Software Tools in JavaScript*.
The title has been changed to better reflect its content and intention.

## FAQ

-   **Is this done yet?**
    Almost: what we have now is a complete, usable draft.

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
    An average of four or five hours a week over the course of a year.
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
        or write and explain small tools of their own.
    3.  If you're interested, I'm very happy to chat.
        I'm also happy to give a guest lecture in your software engineering class
	about software design,
	[how to run a meeting](https://www.youtube.com/watch?v=PtewOjRy-1U),
	and/or life in industry.

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

-   **Why are you using your own formatting tools?**
    Believe me, I've tried the alternatives.
    Static site generators like Jekyll, Pelican, and Hugo don't support numbered cross-references,
    while tools like Bookdown and Jupyter Book have complex tech stacks:
    figuring out whether a problem is in the source document,
    a Pandoc template,
    a LaTeX template,
    or somewhere else entirely is very frustrating.
    [Ivy](http://www.dmulholl.com/docs/ivy/main/),
    [BeautifulSoup](https://beautiful-soup-4.readthedocs.io/en/latest/),
    and 700 lines of Python aren't ideal,
    but they've proven to be less painful than the alternatives.
