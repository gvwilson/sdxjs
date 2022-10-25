"""Ivy configuration."""

# Get standard settings.
import sys
sys.path.insert(0, "info")
from mccole import *
del sys.path[0]

# Abbreviation for this document.
abbrev = "sdxjs"

# GitHub repository.
repo = "https://github.com/gvwilson/sdxjs/"

# Specific book settings.
lang = "en"
title = "Software Design by Example"
acronym = "SDXJS"
tagline = "a tool-based introduction with JavaScript"
author = "Greg Wilson"
plausible = "" # "third-bit.com"

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
    "contents",
]

# To do.
todo = []

# Debugging hook.
debug = False

# Warn about missing or unused entries.
warnings = True

# Files to copy verbatim.
copy += [
    "*.as",
    "*.bck",
    "*.ht",
    "*.mx",
]

# Exclusions (don't process).
exclude += [
    "*.as",
    "*.bck",
    "*.ht",
    "*.mx",
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
    main(sys.argv, abbrev)
