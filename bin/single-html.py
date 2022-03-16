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
            content += get(os.path.join(root, ref.attrs["href"], "index.html"))
    content += FOOTER
    print(content)


def get(path):
    with open(path, "r") as reader:
        soup = BeautifulSoup(reader.read(), "html.parser")
    title = soup.find("h1")
    content = soup.find("main")
    return f"{title}\n{content}\n"


if __name__ == "__main__":
    main()
