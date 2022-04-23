#!/usr/bin/env python

"""Create single-page HTML version of book."""

import sys
import os
from bs4 import BeautifulSoup

HEADER = """\
<html>
<body>
"""

FOOTER = """\
</body>
</html>
"""

def main():
    root = os.path.dirname(sys.argv[1])
    with open(sys.argv[1], "r") as reader:
        soup = BeautifulSoup(reader.read(), "html.parser")
    content = HEADER 
    body = soup.find("body")
    for toc in [x for x in body.select("ol.toc")]:
        for ref in toc.find_all("a"):
            slug = ref.attrs["href"].rstrip("/")
            path = os.path.join(root, slug, "index.html")
            content += get(path, slug)
    content += FOOTER
    print(content)


def get(path, slug):
    with open(path, "r") as reader:
        soup = BeautifulSoup(reader.read(), "html.parser")

    main = soup.find("main")
    main.name = "section"
    main["class"] = "new-chapter"
    patch_chapter_refs(main)
    patch_glossary(main)
    patch_images(main, slug)
    patch_bib_refs(main)

    title = soup.find("h1")
    main.insert(0, title)

    return str(main)


def patch_bib_refs(main):
    b = "../bibliography/"
    for node in main.select("a.bibref"):
        if node.attrs["href"].startswith(b):
            node.attrs["href"] = node.attrs["href"].replace(b, "")


def patch_chapter_refs(main):
    for node in main.select("a"):
        if ("href" in node.attrs) and (node.attrs["href"].startswith("../") and (node.attrs["href"].endswith("/"))):
            node.attrs["href"] = node.attrs["href"].replace("../", "#", 1)[:-1]


def patch_glossary(content):
    g = "../glossary/"
    for node in content.select("a.glossref"):
        if node.attrs["href"].startswith(g):
            node.attrs["href"] = node.attrs["href"].replace(g, "")


def patch_images(content, slug):
    for node in content.find_all("img"):
        if node.attrs["src"].startswith("./"):
            relative = node.attrs["src"][2:]
            node.attrs["src"] = f"./{slug}/{relative}"


if __name__ == "__main__":
    main()
