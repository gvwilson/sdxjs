"""Count lines in files.

The `[% linecount filename %]` shortcode inserts the number of lines
in the file (relative path).
"""

import shutil

import ivy
import shortcodes
import util


@shortcodes.register("linecount")
def excerpt(pargs, kwargs, node):
    """Count lines in file."""
    # Error checking.
    if (len(pargs) != 1) or kwargs:
        util.fail("Badly-formatted linecount shortcode (need exactly one file name).")

    # Count.
    file = pargs[0]
    inclusions = util.make_config("inclusions")
    filepath = util.inclusion_filepath(inclusions, node, file)
    try:
        with open(filepath, "r") as reader:
            return str(len(reader.readlines()))
    except OSError:
        util.fail(f"Unable to count lines in '{filepath}' in {node.filepath}.")
