"""Include files from root directory."""

import re
from pathlib import Path

import ark
import shortcodes
import util

TITLE = re.compile(r"^#\s+.+?\n")


@shortcodes.register("root")
def root(pargs, kwargs, node):
    """Include a file from the root directory, stripping off its h1 title."""
    util.require(
        (len(pargs) == 1) and not kwargs, f"Bad 'root' shortcode in {node.filepath}"
    )

    filename = pargs[0]
    fullpath = Path(ark.site.home(), filename)
    util.require(fullpath.exists(), f"No file {filename} in root directory")
    with open(fullpath, "r") as reader:
        content = reader.read()
    content = TITLE.sub("", content)
    return content
