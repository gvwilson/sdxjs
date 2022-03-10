"""Manage links in Markdown files.

To keep links consistent between files, create a YAML file containing
links triples:

    - key: "some-identifier"
      url: "https://some/url/"
      title: "Some identifying text"

and then add `links = "filename.yml"` entry to `config.py`.

-   `links_table` turns the `[% links %]` shortcode into an HTML table
    showing the descriptions and URLs.

-   `links_append` turns these into a Markdown links table:

        [slug-1]: url-1
        [slug-2]: url-2

    and appends it to the bottom of every `.md` file so that all links
    in Markdown pages can be written `[text][slug]`.
"""

import ivy
import shortcodes
import util
import yaml


@shortcodes.register("links")
def links_table(pargs, kwargs, node):
    """Create a table of links."""
    links = util.get_config("links")

    links = "\n".join(
        f'<tr><td>{entry["title"]}</td><td><a href="{entry["url"]}">{entry["url"]}</a></td></tr>'
        for entry in links
    )
    title = "<tr><th>Link</th><th>URL</th></tr>"
    return f'<table class="links-table">\n{title}\n{links}\n</table>'


@ivy.events.register(ivy.events.Event.INIT)
def links_append():
    """Add Markdown links table to Markdown files."""
    if "links" not in ivy.site.config:
        return

    with open(ivy.site.config["links"], "r") as reader:
        links = yaml.safe_load(reader)
    util.make_config("links", links)

    links_table = "\n".join(f'[{entry["key"]}]: {entry["url"]}' for entry in links)

    def visitor(node):
        if _needs_links(node):
            node.text += "\n\n" + links_table

    ivy.nodes.root().walk(visitor)


def _needs_links(node):
    """Markdown files and slides need links."""
    if node.ext == "md":
        return True
    if node.meta.get("template", None) == "slides":
        return True
    return False
