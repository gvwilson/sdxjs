---
permalink: "/contributing/"
title: "Contributing"
---

## Making Decisions

This project uses Martha's Rules for consensus decision making:

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
    it is immediately moved to a formal vote with no further discussion.

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
    Use `help wanted` if you need assistance or want someone else to take it over,
    `in review` when the pull request is ready for review or being reviewed,
    and `ready to publish` when work is ready for publication

1.  The first draft for each topic should be point-form notes and working code.
    We will reorganize these once we have written enough to see overall scope.

## Format

1.  We use [Jekyll][jekyll] to create a [GitHub Pages][github-pages] site for this project,
    so please write in [GitHub-Flavored Markdown][gfm].

1.  Each lesson is in a file `./slug/index.md`,
    where "slug" is a hyphenated short name for the topic (e.g., `writing-functions`).

1.  `_data/lessons.yml` contains an entry for each lesson.
    The `link` field in the entry and the name of the sub-directory must be the same.
    The other fields are:
    -   `name`: the lesson's title.
    -   `lede`: a short sub-heading describing the lesson.
    -   `keypoints`: a point-form Markdown list of key points.
    -   `exercises`: a list of Markdown-formatted exercises, each of which must contain:
        -   `slug`: the stem of the files containing the problem and the solution (discussed below).
        -   `title`: the exercise title.

1.  Each exercise must have a problem description and a solution.
    These must live in the lesson directory:
    we have tried putting them in sub-directories,
    but Jekyll gets confused about inclusion paths.
    If the lesson's slug is `lesson` and the problem's slug is `some-question`,
    the exercise must have:
    -   `lesson/some-question-problem.md`: the exercise description.
    -   `lesson/some-question-solution.md`: a sample solution.

1.  Standard appendices are listed in `_data/standards.yml`.
    Each must have `name` and `link` (as above).
    If the corresponding file is in the project's root directory
    (e.g., `authors.md` for `/authors/`),
    no other fields are required.
    The YAML entry must include `path`
    to accommodate files like `LICENSE.md` and `CONDUCT.md`
    whose names are set by GitHub conventions
    but do not fit our naming scheme.

1.  Extra project-specific appendices can be listed in `_data/extras.yml`.
    Each entry must have `name` and `link`,
    and must be in a sub-directory like a lesson.

1.  Use relative links `{% raw %}[like this](../slug/){% endraw %}`
    to refer from one lesson to another.

1.  Use level-2 headings for sub-topics, and phrase these as questions
    (e.g., "How do I check if a file exists?").
    Do not use headings below level 3.

1.  Put definitions of external links in the `links` table in `_data/links.yml`
    and refer to them using `{% raw %}[text to display][link-key]{% endraw %}`.
    (We cannot put this in the page template
    because of the order in which Jekyll does link expansion and file inclusion.)
    Entries should be in alphabetical order by slug and each should look like this:

    ```text
    - slug: gfm
      link: https://github.github.com/gfm/
      name: "GitHub-Flavored Markdown"
      lede: "Describes the variant of Markdown used in GitHub Pages."
    ```

1.  When defining a term,
    use `{% raw %}[some text][some-key]{% endraw %}` in the text
    and add an entry like this to the table in `_data/glossary.yml`
    (in alphabetical order by term):

    ```text
    - term: "data science"
      slug: data-science
      defn: |
        Statistics, but less rigorous and better paid.
    ```

    If a `link` field is present in the YAML,
    the term name will be wrapped in that link.
    If an `acronym` field is present,
    the acronym will be included after the term name.

1.  Use the following for bibliographic citations:

    ```text
    {% raw %}{% include cite.md keys="key1,key2" %}{% endraw %}
    ```

    The keys must match BibTeX keys in `references.bib`.
    All keys must be lower case to be consistent with Jekyll's formatting.

1.  `references.md` is generated from `references.bib` by `make bib`,
    or by building or serving the project locally with `make site` or `make serve`.
    Since Jekyll doesn't do this for us,
    `references.md` must be committed to the repository after changes.

1.  Use the following to include external figures:

    ```text
    {% raw %}{% include figure.html key="hyphenated-stem" caption="Caption" explain="Description of figure" %}{% endraw %}
    ```

    where the SVG file is in `./chapter-slug/figures/hyphenated-stem.svg`.
    The `explain` parameter should describe the image, not simply repeat the caption.

1.  To refer to a figure in the same lesson, use:

    ```text
    {% raw %}{% include figref.md key="someKey" %}{% endraw %}
    ```

    To refer to a figure in another lesson, use:

    ```text
    {% raw %}{% include figref.md slug="someSlug" key="someKey" %}{% endraw %}
    ```

1.  Use first person plural ("we" rather than "you"),
    Simplified English (i.e., American spelling),
    and the Oxford comma.

## Tools

-   To preview locally, install [Jekyll][jekyll].
    No plugins are used so that everything will build on GitHub.
-   The scripts in `./bin' use [Python 3][python].
    Some of these are run by `make site` and `make serve`,
    and the files they generate must be committed to version control
    (because Jekyll doesn't do figure numbering).
-   We use the [TeX Live][tex-live] distribution of [LaTeX][latex] to generate PDFs.
-   We use `rsvg-convert` to convert SVG plots and diagrams to PDF.
    Please search the web for the latest installation instructions
    for your preferred operating system.

{% include links.md %}
