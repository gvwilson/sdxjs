---
---

# Contributing

All contributors must abide by our <span i="Code of Conduct">Code of Conduct</span>.

## Making Decisions

This project uses [Martha's Rules][marthas-rules] <cite>Minahan1986</cite> for consensus decision making:

1.  Before each meeting, anyone who wishes may sponsor a proposal by filing an
    issue in the GitHub repository tagged "proposal".  Proposals must be filed
    at least 24 hours before a meeting in order to be considered at that
    meeting, and must include:
    -   a one-line summary (the subject line of the issue)
    -   the full text of the proposal
    -   any required background information
    -   pros and cons
    -   possible alternatives

2.  A quorum is established in a meeting if half or more of voting members are
    present.

3.  Once a person has sponsored a proposal, they are responsible for it.  The
    group may not discuss or vote on the issue unless the sponsor or their
    delegate is present.  The sponsor is also responsible for presenting the
    item to the group.

4.  After the sponsor presents the proposal, a "sense" vote is cast for the
    proposal prior to any discussion:
    -   Who likes the proposal?
    -   Who can live with the proposal?
    -   Who is uncomfortable with the proposal?

5.  If all of the group likes or can live with the proposal, it passes
    immediately.

6.  If most of the group is uncomfortable with the proposal, it is postponed for
    further rework by the sponsor.

7.  Otherwise, members who are uncomfortable can briefly state their objections.
    A timer is then set for a brief discussion moderated by the facilitator.
    After 10 minutes or when no one has anything further to add (whichever comes
    first), the facilitator calls for a yes-or-no vote on the question: "Should
    we implement this decision over the stated objections?"  If a majority votes
    "yes" the proposal is implemented.  Otherwise, the proposal is returned to
    the sponsor for further work.

## What We're Looking For

We would welcome
translations of this book into other programming languages,
or into other human languages.
We would also be grateful for chapters on other tools, such as:

-   An accessibility checking tool like <span i="WebAIM WAVE">[WAVE][webaim-wave]</span>
    (which we have used while building this site)?

-   Formal verification tools
    like <span i="Alloy; formal verification!Alloy">[Alloy][alloy]</span> <cite>Jackson2016</cite>
    and <span i="TLA+; formal verification!TLA+">[TLA+][tla+]</span> work <cite>Wayne2018</cite>.

-   <span i="code completion">[Intelligent code completion][intelligent-code-completion]</span>.

-   <span i="fuzz testing">[Fuzzing][fuzzing]</span> and
    <span i="delta debugging">[delta debugging][delta-debugging]</span> <cite>Zeller2009</cite>.

-   How relational databases work
    ([this tutorial][db-tutorial] could serve as a starting point).

-   How to create [an HTTP server][500-lines-server] from the socket layer up.

-   A text editor using [termit][termit] or [kilo][kilo] as a starting point.
    (Turns out that "undo" is a lot harder to build than most people realize.)

-   A very simple version of [React][react-tutorials] and <span i="Redux">[Redux][redux]</span>.

-   <span i="OAuth">[OAuth][oauth]</span> for single sign-on.

-   A text-mode browser like [Lynx][lynx].

-   A collaborative text editor like [Etherpad][etherpad]
    (the synchronization algorithm is _hard_).

-   An in-browser testing tool like [Cypress][cypress].

-   A package repository that's resistant to DoS attacks.

-   A distributed logging and monitoring tool.

## Formatting

This site uses [McCole][mccole]	for formatting. Please see its documentation for
formatting guidelines. In brief:

-   McCole uses [CommonMark][commonmark] with extensions.
    (In our defense, *everyone* adds extensions…)

-   Chapter titles go in the `mccole.yml` configuration file,
    *not* in the chapter itself.

-   All level-2 section headings should have an ID.

-   Figures are created using:
    ```
    <figure id="short-figure">
      <img src="figures/short.svg" alt="Short caption" />
      <figcaption>Long version of short caption.</figcaption>
    </figure>
    ```

-   Tables are created using:
    ```
    <div class="table" id="short-table" cap="Short table caption.">
    | Left | Right |
    | ---- | ----- |
    | 123  | 456   |
    ```

-   Use `<a section="label"/>` to reference a section,
    `<a figure="label"/>` to reference a figure,
    and `<a table="label"/>` to reference a figure.

-   Use `<cite>Key1,Key2</cite>` for bibliographic citations.
    Bibliography entries go in `_data/bibliography.bib`.

-   Use `<span g="gloss_key">text</span>` to reference the glossary.
    The glossary is in `_data/glossary.yml` in [Glosario][glosario]
    format.

-   Use `<span i="index term">text</span>` for index entries.

-   If a term is both a glossary entry and an index entry,
    use `<span g="gloss_key" i="index term">text</span>`;
    the `g` must come before the `i` attribute.

-   Use a blockquote with a level-3 heading to create a callout:
    ```
    > ### Callout Title
    >
    > This is a paragraph.
    ```

-   Use `[text][key]` for external links, which are defined
    in `_data/links.yml`.
