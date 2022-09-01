"""Ivy configuration."""

# Theme.
theme = "mccole"

# Enable various Markdown extensions.
markdown_settings = {"extensions": ["markdown.extensions.extra"]}

# Site title and author.
title = "Software Design by Example"
subtitle = "A Tool-Based Introduction with JavaScript"
author = "Greg Wilson"

# Output directory.
out_dir = "docs"

# GitHub repository.
repo = "https://github.com/software-tools-books/stjs/"

# Site logo.
logo = "files/codebender.svg"

# Use "a/" URLs instead of "a.html".
extension = "/"

# Language code.
lang = "en"

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
    "links",
    "contents",
]

# BibTeX bibliography file and style.
bibliography = "info/bibliography.bib"
bibliography_style = "unsrt"

# Glossary definitions.
glossary = "info/glossary.yml"

# Link table file.
links = "info/links.yml"

# Footer entries are (link, title).
footer = [
    ("@root/license/", "License"),
    ("@root/conduct/", "Code of Conduct"),
    ("@root/bibliography/", "Bibliography"),
    ("@root/glossary/", "Glossary"),
    ("@root/links/", "Links"),
    (repo, "GitHub"),
]

# Debugging hook.
debug = False
