"""Ivy configuration."""

# ----------------------------------------

# Abbreviation for this document.
abbrev = "sdxjs"

# GitHub repository.
repo = "https://github.com/gvwilson/sdxjs/"

# Site title and author.
title = "Software Design by Example"
acronym = "SDXJS"
tagline = "a tool-based introduction with JavaScript"
author = "Greg Wilson"

# Chapter and appendix slugs in order.
chapters = [
    "introduction",
    "systems-programming",
    "async-programming",
    "unit-test",
    "file-backup",
    "data-table",
    "pattern-matching",
    "regex-parser",
    "page-templates",
    "build-manager",
    "layout-engine",
    "file-interpolator",
    "module-loader",
    "style-checker",
    "code-generator",
    "doc-generator",
    "module-bundler",
    "package-manager",
    "virtual-machine",
    "debugger",
    "conclusion",
]

appendices = [
    "license",
    "conduct",
    "contributing",
    "bibliography",
    "glossary",
    "credits",
    "contents",
]

# To do.
todo = []

# Debugging hook.
debug = False

# Warn about missing or unused entries.
warnings = True

# ----------------------------------------

# Theme.
theme = "mccole"

# Enable various Markdown extensions.
markdown_settings = {
    "extensions": [
        "markdown.extensions.extra",
        "markdown.extensions.smarty",
        "pymdownx.superfences"
    ]
}

# External files.
acknowledgments = "info/acknowledgments.yml"
bibliography = "info/bibliography.bib"
bibliography_style = "unsrt"
credits = "info/credits.yml"
glossary = "info/glossary.yml"
links = "info/links.yml"
dom = "info/dom.yml"

# Language code.
lang = "en"

# Input and output directories.
src_dir = "src"
out_dir = "docs"

# Use "a/" URLs instead of "a.html".
extension = "/"

# Files to copy verbatim.
copy = [
    "*.as",
    "*.ht",
    "*.js",
    "*.json",
    "*.mx",
    "*.out",
    "*.png",
    "*.py",
    "*.sh",
    "*.svg",
    "*.txt",
    "*.yml",
]

# Exclusions (don't process).
exclude = [
    "Makefile",
    "*.as",
    "*.csv",
    "*.gz",
    "*.ht",
    "*.js",
    "*.json",
    "*.mk",
    "*.mx",
    "*.out",
    "*.pdf",
    "*.png",
    "*.py",
    "*.pyc",
    "*.sh",
    "*.svg",
    "*.tll",
    "*.txt",
    "*.yml",
    "*~",
    "__pycache__",
    ".pytest_cache",
    "x-*",
]

# Display values for LaTeX generation.
if __name__ == "__main__":
    import sys

    assert len(sys.argv) == 2, "Expect exactly one argument"
    if sys.argv[1] == "--abbrev":
        print(abbrev)
    elif sys.argv[1] == "--latex":
        print(f"\\title{{{title}}}")
        print(f"\\subtitle{{{tagline}}}")
        print(f"\\author{{{author}}}")
    elif sys.argv[1] == "--tagline":
        print(tagline)
    elif sys.argv[1] == "--title":
        print(title)
    else:
        assert False, f"Unknown flag {sys.argv[1]}"
