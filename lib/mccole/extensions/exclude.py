"""Handle file exclusions."""

from fnmatch import fnmatch
from pathlib import Path

import ivy

from util import IGNORE_FILE


@ivy.filters.register(ivy.filters.Filter.LOAD_NODE_FILE)
def keep_file(value, filepath):
    """Only process the right kinds of files."""
    here_ignore = Path(filepath).parent.joinpath(IGNORE_FILE)
    return not _ignore(here_ignore, filepath)


@ivy.filters.register(ivy.filters.Filter.LOAD_NODE_DIR)
def keep_dir(value, dirpath):
    """Do not process directories excluded by parent."""
    parent_ignore = Path(Path(dirpath).parent, IGNORE_FILE)
    return not _ignore(parent_ignore, dirpath)


def _ignore(ignore_path, path):
    """Check for pattern-based exclusion."""
    if ignore_path.exists():
        with open(ignore_path, "r") as reader:
            patterns = [x.strip() for x in reader.readlines()]
            if any(fnmatch(path.name, pat) for pat in patterns):
                return True

    if (patterns := ivy.site.config.get("exclude", None)) is None:
        return False
    return any(fnmatch(path, pat) for pat in patterns)
