---
title: "Contributing"
---

All contributors must abide by our <xref key="conduct">Code of Conduct</xref>.

## Making Decisions

This project uses [Martha's Rules](https://journals.sagepub.com/doi/10.1177/088610998600100206) for consensus decision making:

1.  Before each meeting, anyone who wishes may sponsor a proposal by filing an issue in the GitHub repository tagged "proposal".
    Proposals must be filed at least 24 hours before a meeting in order to be considered at that meeting, and must include:
    -   a one-line summary (the subject line of the issue)
    -   the full text of the proposal
    -   any required background information
    -   pros and cons
    -   possible alternatives

2.  A quorum is established in a meeting if half or more of voting members are present.

3.  Once a person has sponsored a proposal, they are responsible for it.
    The group may not discuss or vote on the issue unless the sponsor or their delegate is present.
    The sponsor is also responsible for presenting the item to the group.

4.  After the sponsor presents the proposal,
    a "sense" vote is cast for the proposal prior to any discussion:
    -   Who likes the proposal?
    -   Who can live with the proposal?
    -   Who is uncomfortable with the proposal?

5.  If all of the group likes or can live with the proposal,
    it passes immediately.

6.  If most of the group is uncomfortable with the proposal,
    it is postponed for further rework by the sponsor.

7.  Otherwise,
    members who are uncomfortable can briefly state their objections.
    A timer is then set for a brief discussion moderated by the facilitator.
    After 10 minutes or when no one has anything further to add (whichever comes first),
    the facilitator calls for a yes-or-no vote on the question:
    "Should we implement this decision over the stated objections?"
    If a majority votes "yes" the proposal is implemented.
    Otherwise, the proposal is returned to the sponsor for further work.

## Development Process

1.  Use `discussion` to label general discussion threads,
    `proposal` to identify proposals that need to be voted on,
    and `bug` for things that need to be fixed.

1.  When starting work on a subject,
    create an issue labelled `in progress` and assign it to yourself.
    Use `help wanted` if you need assistance or want someone else to take it over
    and `ready for review` when the pull request is ready for review or being reviewed.

1.  The first draft for each topic should be point-form notes and working code.
    We will reorganize these once we have written enough to see overall scope.

## Format

1.  We use [EJS][ejs] to create our website.
    Please write in Markdown where you can, and use HTML tags for special cases.
    (Note that you cannot nest Markdown inside HTML.)

1.  Use first person plural ("we" rather than "you"),
    Simplified English (i.e., American spelling),
    and the Oxford comma.
    Do not use exclamation marks—few things are actually that surprising the first time around,
    and none the second.

1.  `_config.yml` contains configuration information and metadata about chapters and appendices.

1.  Each lesson is in a file `./slug/index.md`,
    where "slug" is a hyphenated short name for the topic (e.g., `writing-functions`).

1.  Use level-2 headings for sub-topics, and phrase these as questions
    (e.g., "How do I check if a file exists?").
    Do not use headings below level 3.

1.  Put definitions of external links in `_links.yml`
    and refer to them using `[text to display][link-key]`.
    Entries should be in alphabetical order by slug.

1.  Write cross-references like `<xref key="slug"></xref>` or `<xref key="slug">some text</xref>`
    to refer from one chapter or appendix to another.
    (We cannot use the empty tag `<xref key="slug"/>` because the parser doesn't like it.)
    `static/site.js` converts this to a glossary reference in the online version
    and `_tools/latex.js` converts it for the PDF version;
    if no text is provided inside the tag,
    we fill it in with `Chapter N` or `Appendix X`.

1.  When defining a term, use `<g key="some_key">some text</g>`.
    The key must exist in either `_gloss.yml` (our local glossary),
    and again, `static/site.js` and `_tools/latex.js` convert this to a glossary reference.

1.  Use `<cite>Key123,Key456</cite>` for bibliographic citations.
    The keys must exist in `_bib.yml`, and yes, `static/site.js` and `_tools/latex.js` do the conversions.

1.  We use [JavaScript Standard Style][standard-js] almost everywhere
    ("almost" because some of our examples have to break the rules to illustrate points).
    Please install `standard` and check your code with it using `make standard` before committing;
    if you need to break a rule, add an [ESLint][eslint] directive to the source file:
    `_tools/html.js` removes these during Markdown-to-HTML conversion.

1.  There is a Makefile in each topic directory that rebuilds all of the included files for that topic.
    1.  All output is saved in `.txt` files
        (except for a few cases where the output is runnable JavaScript, which is saved in `.js` files).
    1.  The rules to re-run simple cases that don't require command-line arguments or error handling
        are in `./_rules.mk`.
    1.  More complicated cases are in shell scripts (`.sh` files).
        All the mechanics of re-running examples must be in the `.sh` file rather than the Makefile
        so that the commands used to re-create an example can be included in the chapter file.

## Exercises

1.  Create a sub-directory for each, e.g., `style-checker/some-question`.

1.  Add a file in that sub-directory called `problem.md` and another called `solution.md`.
    Do *not* put the exercise title in either file.

1.  Put any files needed for the exercise in the same sub-directory,
    and include the sub-directory name when including them in the Markdown.

1.  Add a key `exercises` to the YAML for the chapter with sub-keys `slug` and `title`.
    The slug must match the sub-directory name (e.g., `some-question`);
    the title will be used as a level-3 heading in the chapter and in the solutions.

## Tasks and Tools

1.  NPM doesn't allow us to document our tasks or make them depend on one another,
    so we use [NPM][npm] to manage packages and GNU Make to run tasks:
    run `make` to get help with the latter.
    All of our tools are in the `_tools` directory.
