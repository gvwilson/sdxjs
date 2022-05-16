#!/usr/bin/env python

"""Turn single-page HTML into LaTeX."""

import argparse
import re
import sys
from bs4 import BeautifulSoup, NavigableString, Tag


CROSSREFS = {
    "Appendix": "appref",
    "Chapter": "chapref",
    "Section": "secref"
}


def main():
    """Convert HTML to LateX."""
    options = parse_args()
    text = sys.stdin.read()
    soup = BeautifulSoup(text, "html.parser")
    state = {
        "appendix": False,
        "unknown": set()
    }
    accum = []
    for child in soup.find_all("section", class_="new-chapter"):
        accum = handle(child, state, accum, True)
    result = "".join(accum)

    with open(options.head, "r") as reader:
        print(reader.read())
    print(result)
    with open(options.foot, "r") as reader:
        print(reader.read())

    for key in sorted(state["unknown"]):
        print(key, file=sys.stderr)


def children(node, state, accum, doEscape):
    """Convert children of node."""
    for child in node:
        handle(child, state, accum, doEscape)
    return accum


def citation(node, state, accum, doEscape):
    """Handle bibliographic citation."""
    cites = node.find_all("a")
    assert all(has_class(child, "bibref") for child in cites)
    keys = ",".join([c["href"].lstrip("#") for c in cites])
    accum.append(rf"\cite{{{keys}}}")


def escape(text, doEscape):
    '''Escape special characters if asked to.'''
    if not doEscape:
        return text
    return text\
        .replace('{', 'ACTUAL-LEFT-CURLY-BRACE')\
        .replace('}', 'ACTUAL-RIGHT-CURLY-BRACE')\
        .replace('\\', r'{\textbackslash}')\
        .replace('$', r'\$')\
        .replace('%', r'\%')\
        .replace('_', r'\_')\
        .replace('^', r'{\textasciicircum}')\
        .replace('#', r'\#')\
        .replace('&', r'\&')\
        .replace('©', r'{\textcopyright}')\
        .replace('μ', r'{\textmu}')\
        .replace('…', '...')\
        .replace('ACTUAL-LEFT-CURLY-BRACE', r'\{')\
        .replace('ACTUAL-RIGHT-CURLY-BRACE', r'\}')


def figure(node, state, accum, doEscape):
    """Convert a figure."""
    assert node.name == "figure", "Not a figure"
    label = node["id"]
    path = node.img["src"].replace(".svg", ".pdf")
    caption = "".join(children(node.figcaption, state, [], True))
    caption = caption.split(":", 1)[1].strip()
    accum.append(f"\\figpdf{{{label}}}{{{path}}}{{{caption}}}{{0.6}}\n")


def handle(node, state, accum, doEscape):
    """Handle nodes by type."""

    # Pure text
    if isinstance(node, NavigableString):
        accum.append(escape(node.string, doEscape))

    # Not a tag
    elif not isinstance(node, Tag):
        pass

    # <a class="crossref"> => section cross-reference
    elif (node.name == "a") and has_class(node, "crossref"):
        key = node["href"].lstrip("#")
        kind = node.text.split(" ")[0]
        assert kind in CROSSREFS
        accum.append(rf"\{CROSSREFS[kind]}{{{key}}}")

    # <a class="figref"> => figure cross-reference
    elif (node.name == "a") and has_class(node, "figref"):
        key = node["href"].split("#")[1]
        accum.append(rf"\figref{{{key}}}")

    # <a class="glossref"> => glossary cross-reference
    elif (node.name == "a") and has_class(node, "glossref"):
        accum.append(r"\glossref{")
        children(node, state, accum, doEscape)
        accum.append("}")

    # <a class="linkref"> => just show the link
    elif (node.name == "a") and has_class(node, "linkref"):
        children(node, state, accum, doEscape)

    # <a class="tblref"> => table cross-reference
    elif (node.name == "a") and has_class(node, "tblref"):
        key = node["href"].split("#")[1]
        accum.append(rf"\tblref{{{key}}}")

    # <a> without class
    elif node.name == "a":
        # pure internal link in glossary
        if node["href"].startswith("#"):
            accum.append(r"\glosskey{")
            children(node, state, accum, doEscape)
            accum.append("}")
        # external link
        else:
            accum.append(r"\hreffoot{")
            children(node, state, accum, doEscape)
            accum.append("}{")
            accum.append(escape(node["href"], True))
            accum.append("}")

    # <blockquote> => callout (formatted as quotation)
    elif node.name == "blockquote":
        accum.append("\\begin{callout}\n")
        children(node, state, accum, doEscape)
        accum.append("\\end{callout}\n")

    # <code> => inline typewriter text
    elif node.name == "code":
        temp = "".join(children(node, state, [], True))
        temp = temp.replace("'", r"{\textquotesingle}")
        accum.append(rf"\texttt{{{temp}}}")

    # <div class="bibliography"> => placeholder for bibliography
    elif (node.name == "div") and has_class(node, "bibliography"):
        accum.append("\\printbibliography[heading=none]\n")

    # <div class="break-before"> => pass through
    elif (node.name == "div") and has_class(node, "break-before"):
        children(node, state, accum, doEscape)


    # <div class="pagebreak"> => force a LaTeX page break
    elif (node.name == "div") and has_class(node, "pagebreak"):
        accum.append("\n\\newpage\n")

    # <div class="table"> => pass through
    elif (node.name == "div") and has_class(node, "table"):
        children(node, state, accum, doEscape)

    # <em> => italics
    elif node.name == "em":
        accum.append(r"\emph{")
        children(node, state, accum, doEscape)
        accum.append(r"}")

    # <figure> => figpdf macro
    elif node.name == "figure":
        figure(node, state, accum, doEscape)

    # <h1> => chapter title
    elif node.name == "h1":
        assert node.has_attr("id")
        state["slug"] = node["id"]
        content = "".join(children(node, state, [], doEscape))
        kind, title = content.split(":", 1)
        if kind.startswith("Appendix") and not state["appendix"]:
            accum.append("\n\\appendix\n")
            state["appendix"] = True
        accum.append(r"\chapter{")
        accum.append(title.strip())
        accum.append(r"}\label{")
        accum.append(state["slug"])
        accum.append("}\n")

    # <h2> => section title (with or without ID)
    elif node.name == "h2":
        title = "".join(children(node, state, [], doEscape))
        if ":" in title:
            title = title.split(":", 1)[1].strip()
        if node.has_attr("id"):
            accum.append(r"\section{")
            accum.append(title)
            accum.append(r"}\label{")
            accum.append(node["id"])
            accum.append("}\n")
        else:
            accum.append(r"\section*{")
            accum.append(title)
            accum.append("}\n")

    # <h3> inside <blockquote> => callout title
    elif (node.name == "h3") and (node.parent.name == "blockquote"):
        accum.append("\n")
        accum.append(r"\subsubsection*{")
        children(node, state, accum, doEscape)
        accum.append("}\n")

    # other <h3> => subsection (unnumbered)
    elif node.name == "h3":
        accum.append(r"\subsection*{")
        children(node, state, accum, doEscape)
        accum.append("}\n")

    # <li> => list item
    elif node.name == "li":
        accum.append(r"\item ")
        children(node, state, accum, doEscape)
        accum.append("\n")

    # <ol> => ordered list
    elif node.name == "ol":
        accum.append("\\begin{enumerate}\n")
        children(node, state, accum, doEscape)
        accum.append("\\end{enumerate}\n")

    # <p> => paragraph (possibly a continuation)
    elif node.name == "p":
        accum.append("\n")
        if has_class(node, "continue"):
            accum.append(r"\noindent")
            accum.append("\n")
        children(node, state, accum, doEscape)
        accum.append("\n")

    # <pre> => preformatted text
    elif node.name == "pre":
        title = ""
        if node.has_attr("title"):
            title = f"caption={{{node['title']}}},captionpos=b,"
        child = node.contents[0]
        assert child.name == "code", "Expected code as child of pre"
        accum.append(f"\\begin{{lstlisting}}[{title}frame=single,frameround=tttt]\n")
        children(child, state, accum, False)
        accum.append("\\end{lstlisting}\n")

    # <section> => chapter (recurse only)
    elif node.name == "section":
        if node.h1["id"] == "contents":
            accum.append("\\printindex\n")
        else:
            children(node, state, accum, doEscape)

    # <span class="citation"> => citations
    elif (node.name == "span") and has_class(node, "citation"):
        citation(node, state, accum, doEscape)

    # <span class="glosskey"> => format glossary key
    elif (node.name == "span") and has_class(node, "glosskey"):
        accum.append("\\noindent\n")
        accum.append(r"\glosskey{")
        children(node, state, accum, doEscape)
        accum.append(r"}")

    # <span class="indexentry"> => add an index entry
    elif (node.name == "span") and has_class(node, "indexentry"):
        children(node, state, accum, doEscape)
        index_entry(node, state, accum, doEscape)

    # <span> => report
    elif node.name == "span":
        print("SPAN", str(node), file=sys.stderr)

    # <strong> => bold text
    elif node.name == "strong":
        accum.append(r"\textbf{")
        children(node, state, accum, doEscape)
        accum.append(r"}")

    # <table> => a table
    elif node.name == 'table':
        table(node, state, accum, doEscape)

    # <td> => pass through
    elif node.name == "td":
        children(node, state, accum, doEscape)

    # <th> => pass through
    elif node.name == "th":
        children(node, state, accum, doEscape)

    # <ul> => unordered list
    elif node.name == "ul":
        accum.append("\\begin{itemize}\n")
        children(node, state, accum, doEscape)
        accum.append("\\end{itemize}\n")

    # anything else => report
    else:
        state["unknown"].add(str(node))

    # Report back.
    return accum


def has_class(node, cls):
    """Check if node has specified class."""
    return node.has_attr("class") and (cls in node["class"])


def index_entry(node, state, accum, doEscape):
    """Construct index entries."""
    assert (node.name == "span") and node.has_attr("index-key")
    for key in [k.strip() for k in node["index-key"].split(";")]:
        accum.append(fr"\index{{{escape(key, doEscape)}}}")


def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument("--head", required=True, help="LaTeX head")
    parser.add_argument("--foot", required=True, help="LaTeX foot")
    return parser.parse_args()


def table(node, state, accum, doEscape):
    """Convert a table."""
    assert node.name == "table", "Node is not a table"
    label = node["id"] if node.has_attr("id") else None

    assert node.tbody, f"Table node does not have body {node}"
    rows = [table_row(row, state, doEscape, "td") for row in node.tbody.find_all("tr")]
    width = len(node.tbody.find("tr").find_all("td"))
    spec = "l" * width

    thead = node.thead
    if thead:
        row = thead.tr
        assert row, f"Table head does not have row {node}"
        headers = node.thead.tr.find_all("th")
        assert headers, f"Table node does not have headers {node}"
        head = table_row(node.thead.tr, state, doEscape, "th")
        rows = [head, *rows]

    if label:
        caption = "".join(children(node.caption, state, [], True))
        caption = caption.split(":")[1].strip()
        accum.append("\\begin{table}\n")
    else:
        accum.append("\n\\vspace{\\baselineskip}\n")

    accum.append(f"\\begin{{tabular}}{{{spec}}}\n")
    accum.append("\n".join(rows))
    accum.append("\n\\end{tabular}\n")
    if label:
        accum.append(f"\\caption{{{caption}}}\n")
        accum.append(f"\\label{{{label}}}\n")
        accum.append("\\end{table}\n")
    else:
        accum.append("\n\\vspace{\\baselineskip}\n")


def table_row(row, state, doEscape, tag):
    """Convert a single row of a table to a string."""
    cells = row.find_all(tag)
    result = []
    for cell in cells:
        temp = handle(cell, state, [], True)
        temp = "".join(temp)
        if tag == "th":
            temp = rf"\textbf{{\underline{{{temp}}}}}"
        result.append(temp)
    return " & ".join(result) + r" \\"


if __name__ == "__main__":
    main()
