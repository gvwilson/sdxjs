"""Handle figures.

Figures are created using a shortcode:

    [% figure slug="slug" img="source.file" alt="Alt text" caption="Longer caption" %]

An optional `width="x%"` argument can be provided as well. This shortcode
generates:

    <figure id="slug">
      <img src="source.file" alt="Alt text" width="20%"/>
      <figcaption markdown="1">Figure A.1: Longer caption</figcaption>
    </figure>

-   Each instance of the `Figure` class stores information about a single figure.

-   `figure_def` creates a figure. It assumes that figures have already been
    numbered by `collector`.

-   `figure_ref` creates a figure cross-reference. It also assumes that figures have
    already been numbered by `collector`, and that there is a language defined by
    `config["lang"]` that matches a language in `util.TRANSLATIONS`.

-   `copy_files` copies figure files from the source directory to the destination.

-   `collect` extracts information about figures from source files.
"""

import shutil
from dataclasses import dataclass
from textwrap import dedent

import ivy
import shortcodes
import util


@dataclass
class Figure:
    """Keep track of information about a figure."""

    node: ivy.nodes.Node = None
    fileslug: str = ""
    slug: str = ""
    img: str = ""
    alt: str = ""
    caption: str = ""
    number: tuple = ()
    width: str = ""


@shortcodes.register("figure")
def figure_def(pargs, kwargs, node):
    """Handle [% figure slug=slug img=img alt=alt caption=cap %] figure definition."""
    slug = kwargs["slug"]
    figure = util.get_config("figures")[slug]
    label = util.make_label("figure", figure.number)
    width = f'width="{figure.width}"' if figure.width else ""
    return dedent(
        f"""\
    <figure id="{figure.slug}">
      <img src="./{figure.img}" alt="{figure.alt}" {width}/>
      <figcaption markdown="1">{label}: {figure.caption}</figcaption>
    </figure>
    """
    )


@shortcodes.register("f")
def figure_ref(pargs, kwargs, node):
    """Handle [% f slug %] figure reference."""
    # Badly-formatted shortcode.
    if len(pargs) != 1:
        util.fail(f"Badly-formatted 'f' shortcode {pargs} in {node.filepath}")

    # Haven't collected information yet.
    if (figures := util.get_config("figures")) is None:
        return ""

    # Create cross-reference.
    slug = pargs[0]
    if slug not in figures:
        util.fail(f"Unknown figure cross-reference slug {slug} in {node.filepath}")
    figure = figures[slug]
    label = util.make_label("figure", figure.number)
    return f'<a class="figref" href="@root/{figure.fileslug}/#{slug}">{label}</a>'


@ivy.events.register(ivy.events.Event.EXIT_BUILD)
def copy_files():
    """Copy all referenced images files."""
    # Wrong part of the cycle.
    if (figures := util.get_config("figures")) is None:
        return

    # Copy files.
    for fig in figures.values():
        src, dst = util.make_copy_paths(fig.node, fig.img)
        shutil.copy(src, dst)


@ivy.events.register(ivy.events.Event.INIT)
def collect():
    """Collect information by parsing shortcodes."""
    parser = shortcodes.Parser(inherit_globals=False, ignore_unknown=True)
    parser.register(_process_figure, "figure")
    figures = {}
    ivy.nodes.root().walk(lambda node: _parse_shortcodes(node, parser, figures))
    _flatten_figures(figures)


def _parse_shortcodes(node, parser, figures):
    """Collect information from node."""
    extra = {"node": node, "seen": []}
    parser.parse(node.text, extra)
    figures[node.slug] = extra["seen"]


def _process_figure(pargs, kwargs, extra):
    """Collect information from a single figure shortcode."""
    extra["seen"].append(Figure(extra["node"], **kwargs))
    return ""


def _flatten_figures(collected):
    """Convert collected figures information to flat lookup table."""
    major = util.make_major()
    figures = util.make_config("figures")
    for fileslug in collected:
        if fileslug in major:
            for (i, entry) in enumerate(collected[fileslug]):
                entry.fileslug = fileslug
                entry.number = (str(major[fileslug]), str(i + 1))
                figures[entry.slug] = entry
