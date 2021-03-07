---
permalink: /contributing/
---

All contributors must abide by our Code of Conduct.

## Making Decisions

This project uses [Martha's Rules][marthas-rules] <cite>Minahan1986</cite> for consensus decision making:

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

## Formatting

1.  The commands to rebuild the site, run a server, produce the PDF
    version, and check internal consistency are stored in `Makefile`
    and use the tools in `bin/*.py`. Run `make` on its own to get a list
    of available commands.

1.  Each chapter or appendix is identified by a slug such as `version-control`.
    Its text lives in <code><em>slug</em>/index.md</code>, and there is an entry
    under the `chapters` key in `_config.yml` with its slug and its title. This
    list controls ordering.

1.  Use only level-2 headings within chapters and appendices
    and use "Title Case" the titles.

1.  To create a cross-reference:
    -   Use `{% raw %}<span g="key">some text</span>{% endraw %}` for glossary entries.
        The key must appear in `_data/glossary.yml`.
    -   Use `{% raw %}<span x="slug"></span>{% endraw %}` to cross-reference a chapter or appendix.
        The slugs must appear in `_config.yml`.
    -   Use `{% raw %}<span f="key"></span>{% endraw %}` to cross-reference a figure
        and `{% raw %}<span t="key"></span>{% endraw %}` to cross-reference a table.
    -   Use `{% raw %}<cite>key,key</cite>{% endraw %}` for bibliography citations.
        The keys must appear in `bibliography/index.md`.

1.  To include a code sample use
    `{% raw %}{% include code file="name.ext" %}{% endraw %}`.
    The path to the file must be relative to the including file. in most
    cases it will be in the same directory as the chapter or appendix.

1.  To continue a paragraph that has been interrupted by a code sample
    or something else, use:

    ```
    {: .continue}
    text of paragraph
    ```

    This has no effect on the appearance of the HTML, but prevents an
    unwanted paragraph indent in the PDF version.

1.  To create a callout box, use:

    ```
    <div class="callout" markdown="1">
    ### Title of callout

    text of callout
    </div>
    ```

    Use "Sentence case" for the callout's title.

1.  To insert an external link, use `{% raw %}[text][tag]{% endraw %}`
    in the body, then add the link to the Kramdown `link_defs` section
    in `_config.yml`. The clumsy syntax is necessary to get around
    [this bug][jekyll-bug].

1.  To create a figure, put the image file in the same directory as
    the chapter or appendix and use this to include it:

    ```
    {% raw %}{% include figure id="label" img="file.svg" alt="short text" cap="full caption" %}{% endraw %}
    ```

    where `label` has the form <code><em>chapter-slug</em>-<em>image-slug</em></code>,
    `alt` is just a few words long (plain text),
    and `cap` is the full caption that will appear inline (Markdown).

1.  Use [diagrams.net][diagrams] to create SVG diagrams.
    Avoid screenshots when possible,
    since getting them to display correctly in print is a pain.

Note: you will need LaTeX in order to build the PDF version of this book.
After installing it, you will need these package:

-   `babel-english`
-   `babel-greek`
-   `cbfonts`
-   `enumitem`
-   `greek-fontenc`
-   `keystroke`
-   `listings`
-   `textgreek`
-   `tocbibind`
