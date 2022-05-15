#!/usr/bin/env python

"""Create single-page HTML version of book."""

import sys
import os
from bs4 import BeautifulSoup

HEADER = """\
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <link rel="icon" type="image/x-icon" href="favicon.ico">

  <!-- paged.js links -->
  <link rel="stylesheet" href="pagedJS/css/book.css">
  <link rel="stylesheet" href="pagedJS/css/global/style.css">

  <script src="https://unpkg.com/pagedjs/dist/paged.polyfill.js"></script>
  <script src="https://unpkg.com/css-tree@1.1.2/dist/csstree.min.js"></script>
  <script src="pagedJS/js/imposition.js"></script>
  <script src="pagedJS/js/createToc.js"></script>
  <script src="pagedJS/js/reload-in-place.js"></script>
  <script src="pagedJS/js/bibref.js"></script>

  <script>
    // Hook to generate the ToC
    class toc extends Paged.Handler {
        constructor(chunker, polisher, caller) {
            super(chunker, polisher, caller);
        }

        beforeParsed(content) {
            createToc({
                content: content,
                tocElement: '.tocElement',
                titleElements: ['h1', 'h2']
            });
        }

    }
    Paged.registerHandlers(toc);
  </script>
  <title>Software Design by Example: A Tool-Based Introduction with JavaScript</title>
</head>
<body>
    <section class="cover">
      <h1>Software Design by Example: A Tool-Based Introduction with JavaScript</h1>
    </section>
    <section class="tocElement" id="tocElement">
      <h1 id="ToC">Table of Contents</h1>
    </section>
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
    for node in content.select("span.glosskey"):
        if "break-before" in node.attrs["class"]:
            node.attrs["class"] = [c for c in node.attrs["class"] if c != "break-before"]
            if "class" in node.parent.attrs:
                node.parent.attrs["class"].append("break-before")
            else:
                node.parent.attrs["class"] = ["break-before"]


def patch_images(content, slug):
    for node in content.find_all("img"):
        if node.attrs["src"].startswith("./"):
            relative = node.attrs["src"][2:]
            node.attrs["src"] = f"./{slug}/{relative}"


if __name__ == "__main__":
    main()
