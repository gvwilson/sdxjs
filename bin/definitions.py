"""Extract list of defined terms from a file or files."""

import argparse
import re
import sys
import yaml


GLOSS_REF = re.compile(r"\[%g\s+(\w+).+?\]", re.DOTALL)


def main():
    """Main driver."""
    options = _parse_args()

    with open(options.glossary, "r") as reader:
        glossary = yaml.safe_load(reader)
        glossary = {entry["key"]: entry[options.language]["term"] for entry in glossary}

    if options.files is None:
        _get_and_show(sys.stdin, glossary)

    elif isinstance(options.files, str):
        with open(options.files, "r") as reader:
            _get_and_show(reader, glossary)

    else:
        for filename in options.files:
            with open(filename, "r") as reader:
                _get_and_show(reader, glossary, filename)


def _get_and_show(reader, glossary, filename=None):
    """Get definitions and display."""
    text = reader.read()
    terms = [glossary[key] for key in GLOSS_REF.findall(text)]
    if filename:
        print(filename)
        for term in sorted(terms, key=lambda x: x.lower()):
            print(f"- {term}")
    else:
        for term in sorted(terms, key=lambda x: x.lower()):
            print(term)


def _parse_args():
    """Parse command-line arguments."""
    parser = argparse.ArgumentParser()
    parser.add_argument("--files", nargs="+", default=[], help="Files containing definitions")
    parser.add_argument("--glossary", help="Glossary file")
    parser.add_argument("--language", help="Glossary language")
    return parser.parse_args()


if __name__ == "__main__":
    main()
