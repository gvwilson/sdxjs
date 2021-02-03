---
---

All contributors must abide by our <x key="conduct">Code of Conduct</x>.

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

## Structure

1.  Each lesson is in a file `./slug/index.md`,
    where "slug" is a hyphenated short name for the topic (e.g., `build-manager`).

1.  The home page for a Volume 1 is in `./vol1/index.md`,
    and the home pages for other volumes will be in similarly-named directories.

1.  The home page for the site as a whole is in `./index.html`.
    At present, this immediately redirects to the home page of Volume 1.

### Authors

1.  Add an entry in the YAML configuration file for each volume you are contributing to
    (alphabetically by surname) with `id`, `name`, and `img` sub-keys.
    If possible, use your GitHub ID as your `id`.

2.  Create a Markdown file `./authors/id.md` (with your ID instead of `id`)
    with a few lines about yourself.

3.  Add an image to `./static` to be included in the author display.

## Writing Style

1.  Please install [WAVE][webaim-wave] and check that pages are accessible
    before committing changes.

1.  Write in Markdown wherever possible; only use HTML tags for special cases.
    Note that you cannot nest Markdown inside HTML.

1.  Use first person plural ("we" rather than "you"),
    Simplified English (i.e., American spelling),
    and the Oxford comma.

1.  Do not use exclamation marks—few things are actually that surprising the first time around,
    and none the second.

1.  Use level-2 headings for sub-topics, and phrase their titles as questions
    (e.g., "How do I check if a file exists?").
    Do not use headings below level 2 except in callouts.

1.  To display a callout box, use:

    ```
    ::: callout
    ### Title of callout (in sentence case).

    body of callout
    :::
    ```

1.  Use a similar syntax with:
    -   `centered` to create centered blocks
    -   `continue` to continue a paragraph after a code sample
    -   `fixme` to create FIXME markers for further work
    -   `hint` for exercise hints

1.  Put definitions of external links in `links.yml`
    and refer to them using `[text to display][link-key]`.
    Entries should be in alphabetical order by slug.

1.  Write cross-references like `<x key="slug"></x>` or `<x key="slug">some text</x>`
    to refer from one chapter or appendix to another.
    (We cannot use the empty tag `<x key="slug"/>` because the Markdown parser doesn't like it.)
    if no text is provided inside the tag,
    we fill it in with `Chapter N` or `Appendix X`.

1.  When defining a term, use something like `<g key="absolute_path">absolute path</g>`.
    The key must exist in either `gloss.yml` (our local glossary)
    or [Glosario][glosario];
    definitions in the former override definitions in the latter.

1.  Use something like `<cite>Osmani2017,Casciaro2020</cite>` for bibliographic citations.
    The keys must exist in `bib.yml`.

1.  We use [JavaScript Standard Style][standard-js] almost everywhere
    ("almost" because some of our examples have to break rules to illustrate points
    or to fit on the printed page).
    Please install `standard` and check your code with it using `make standard` before committing;
    if you need to break a rule, add an [ESLint][eslint] directive to the source file:
    `./bin/html.js` removes these during Markdown-to-HTML conversion.

### Exercises

1.  Create a sub-directory for each exercise, e.g., `style-checker/x-some-question`.
    (We use the `x-` prefix to make exercise directories easier to see.)

1.  Add a file in that sub-directory called `problem.md` and another called `solution.md`.
    Do *not* put the exercise title in either file.

1.  Put any files needed for the exercise in the same sub-directory.

1.  Add a key `exercises` to the YAML for the chapter with sub-keys `slug` and `title`.
    The slug must match the sub-directory name (e.g., `x-some-question`);
    the title will be used as a level-3 heading in the chapter and in the solutions.

## Configuration and Build

[NPM][npm] doesn't allow us to make tasks depend on one another,
so we use [GNU Make][gnu-make] to manage our build.
To see the available commands, run `make` without any targets.
In order to handle multiple volumes in a single repository,
we have split configuration between several files.

-   `./Makefile`: defines `VOLUME` to be `vol1` by default.
    This can be overridden using `make V=2 target` to build things from Volume 2.

-   `./common.yml`: configuration values shared by all volumes.

-   `./vol1.yml`: configuration values for Volume 1.

-   `./vol2.yml`: configuration values for Volume 2.

### Re-creating Examples

`./examples.mk` contains rules for re-creating examples.
Each chapter directory contains a Makefile that:

-   defines the files to be rebuilt as `TARGETS`,

-   includes `./examples.mk`, and

-   lists any extra dependencies or rules the chapter needs.

The rules in `./examples.mk` can re-create these types of files:

-   `.html`: HTML-formatted text.

-   `.out`: plain text that is to be HTML-escaped when included.
    (We use `.out` as a suffix rather than `.txt` to make the files easier to identify.)

-   `.raw.out`: plain text that is *not* to be HTML-escaped when included.

-   `.slice.out`: a subset of plain-txt output.
    (The two-part suffix tells the Make rules to slice output.)

Shell scripts are used whenever command-line arguments are needed to re-create a file.
The rules used to re-create a file `something.suffix` are (in order):

1.  If there is a shell script `something.sh` *and* a JavaScript file `something.js`,
    then `something.suffix` depends on both
    and is re-created by running the shell script.

1.  If there is only a shell script `something.sh`
    then `something.suffix` depends on it and is re-created by running it.

1.  Finally,
    if there is a JavaScript file `something.js` but not a shell script,
    `something.suffix` depends on the `.js` file and is re-created by running it.

### Miscellaneous

1.  We use [EJS][ejs] to turn Markdown into HTML.
    Our HTML fragments are all in `./inc/*.html`;
    please see `./inc/README.md` for an inventory
    and the comments in individual files for usage.

1.  All of our tools are written in JavaScript and placed in the `bin` directory;
    please see `./bin/README.md` for an inventory.
