#!/usr/bin/env python

"""Create a single-page Markdown version of the book."""

import os
import sys

import frontmatter


def main():
    root_dir = sys.argv[1]
    config_path = sys.argv[2]
    for slug in get_chunks(config_path):
        print_content(root_dir, slug)


def get_chunks(config_path):
    config_dir = os.path.dirname(os.path.abspath(config_path))
    sys.path.insert(0, config_dir)
    from config import chapters, appendices
    sys.path.pop()
    chapters.extend(appendices)
    return chapters


def print_content(root_dir, slug):
    filepath = os.path.join(root_dir, slug, "index.md")
    with open(filepath, "r") as reader:
        page = frontmatter.load(reader)
    print(f"# {page['title']}\n")
    if "lede" in page:
        print(f"*{page['lede']}*\n")
    print(page.content)
    print("\n")


if __name__ == "__main__":
    main()
