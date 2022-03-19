"""Tables of contents.

The `contents` shortcode can generate two different tables of contents:

-   `[% contents 1 %]` generates a top-level ToC for the home page that
    links to each chapter and appendix.

-   `[% contents 2 %]` generates a section-level ToC for a single chapter
    or appendix.

Both shortcodes assume that heading information has already been collected
in `config["mccole"]["headings"]`. If that information isn't there, or if
the `node` argument is empty, `contents` is being called too early in the
processing cycle and does nothing.
"""

import ivy
import shortcodes
import util


@shortcodes.register("contents")
def contents(pargs, kwargs, node):
    """Generate a table of contents."""
    # Must specify level.
    if len(pargs) != 1:
        util.fail(f"Bad arguments to toc shortcode {pargs} in {node.filepath}")
    level = int(pargs[0])

    # Generate by level.
    if level == 1:
        return _toc_1()
    elif level == 2:
        return _toc_2(node)
    else:
        util.fail(f"Bad level {level} in toc shortcode in {node.filepath}")


def _toc_1():
    """Generate top-level table of contents."""
    chapters = _toc_1_part("chapters", "1")
    appendices = _toc_1_part("appendices", "A")
    return f"{chapters}\n{appendices}"


def _toc_1_part(kind, label):
    """Generate either chapters or appendices."""
    headings = util.get_config("headings")
    entries = set(ivy.site.config[kind])
    entries = [
        e for e in headings.values() if (len(e.number) == 1) and (e.fileslug in entries)
    ]

    def _sort_key(k):
        return k.number[0].zfill(3) if k.number[0].isdigit() else k.number[0]

    entries.sort(key=_sort_key)
    items = [f'<li><a href="@root/{e.fileslug}/">{e.title}</a></li>' for e in entries]
    return f'<ol class="toc" type="{label}">\n' + "\n".join(items) + "\n</ol>"


def _toc_2(node):
    """Generate chapter-level table of contents."""
    headings = util.get_config("headings")
    fileslug = node.slug
    entries = [
        e
        for e in headings.values()
        if (e.fileslug == fileslug) and (len(e.number) == 2)
    ]
    entries.sort(key=lambda x: x.number)
    items = [f'<li><a href="#{e.slug}">{e.title}</a></li>' for e in entries]
    return '<ol class="toc">\n' + "\n".join(items) + "\n</ol>"
