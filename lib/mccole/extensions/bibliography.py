"""Generate bibliography.

Bibliographic data is stored in a BibTeX file named in config["bibliography"],
and the bibliography style is named in config["bibliography_style"].

-   `bib_ref` fills in citations created with the shortcode `[% b key1 key2 %]`,
    where the keys reference entries in the BibTeX file.  (The generated HTML
    assumes that the bibliography is in `@root/bibliography/index.html`.)

-   `bibliography` creates an HTML bibliography using Pybtex.

-   `check` checks that all citations are defined and that all bibliography
    entries are referenced.
"""

import ivy
import shortcodes
import util
from pybtex.database import parse_file
from pybtex.plugin import find_plugin


@shortcodes.register("b")
def bib_ref(pargs, kwargs, node):
    """Handle [% b "key1,key2" %] biblography reference shortcodes."""
    if len(pargs) == 0:
        util.fail(f"Empty 'b' shortcode in {node.filepath}")

    citations = util.make_config("citations")
    citations |= set(pargs)

    keys = [f'<a href="@root/bibliography/#{k}">{k}</a>' for k in pargs]
    return f"[{', '.join(keys)}]"


@shortcodes.register("bibliography")
def bibliography(pargs, kwargs, node):
    """Convert bibliography to HTML."""
    if (bib_filename := ivy.site.config.get("bibliography", None)) is None:
        return '<p class="warning">No bibliography specified.</p>'
    if (bib_style := ivy.site.config.get("bibliography_style", None)) is None:
        return '<p class="warning">No bibliography style specified.</p>'

    # Set up Pybtex.
    html = find_plugin("pybtex.backends", "html")()
    style = find_plugin("pybtex.style.formatting", bib_style)()

    # Format a single bibliography entry.
    def _format(key, body):
        return f'<dt id="{key}">{key}</dt>\n<dd>{body}</dd>'

    # Load and save bibliography.
    bib = parse_file(bib_filename)
    util.make_config("bibliography", {k for k in bib.entries.keys()})

    # Generate HTML.
    formatted = style.format_bibliography(bib)
    entries = [_format(entry.key, entry.text.render(html)) for entry in formatted]
    return '<dl class="bibliography">\n\n' + "\n\n".join(entries) + "\n\n</dl>"


@ivy.events.register(ivy.events.Event.EXIT)
def check():
    if (citations := util.get_config("citations")) is None:
        return
    if (bibliography := util.get_config("bibliography")) is None:
        return
    util.report("unknown bibliography citations", citations - bibliography)
    util.report("unused bibliography entries", bibliography - citations)
