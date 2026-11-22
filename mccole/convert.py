#!/usr/bin/env python
"""Convert a chapter's index.md (mccole) into index.qmd (Quarto).

Run from the project root. Usage: python mccole/convert.py CHAP [CHAP ...]
"""

import glob
import os
import re
import sys

import yaml


def convert(chapter):
    src = os.path.join(chapter, "index.md")
    dst = os.path.join(chapter, "index.qmd")
    text = open(src, encoding="utf-8").read()

    # Split YAML frontmatter, keeping the metadata fields (abstract, syllabus, depends).
    title = ""
    front = {}
    m = re.match(r"^---\n(.*?)\n---\n", text, re.DOTALL)
    if m:
        front = yaml.safe_load(m.group(1)) or {}
        body = text[m.end():]
        title = front.get("title", "")
    else:
        body = text

    # Glossary: keep the <span id="key">term</span> anchors; rewrite internal
    # [text](#fragment) links as [text](index.html#fragment).
    body = re.sub(r"\[([^\]]+)\]\(#([^)]+)\)", r"[\1](index.html#\2)", body)

    # Figure: [%figure slug=X img=Y alt="Z" caption="W" %] -> native Quarto figure.
    def figure_repl(m):
        attrs = m.group(1)
        slug = re.search(r"slug=([^\s]+)", attrs)
        img = re.search(r"img=([^\s]+)", attrs)
        caption = re.search(r'caption="([^"]*)"', attrs)
        slug_v = slug.group(1) if slug else ""
        img_v = img.group(1) if img else ""
        cap_v = caption.group(1) if caption else ""
        cap_v = re.sub(r"<code>([^<]*)</code>", r"`\1`", cap_v)
        return "![%s](%s){#fig-%s}" % (cap_v, img_v, slug_v)

    body = re.sub(r"\[%\s*figure\s+([^%]+?)\s*%\]", figure_repl, body)

    # Table: <div id="t:SLUG" data-caption="CAPTION" markdown="1"> ... </div> -> fenced table.
    def table_div_repl(m):
        slug = m.group(1)
        caption = m.group(2)
        content = m.group(3).strip()
        return '::: {#tbl-%s tbl-cap="%s"}\n%s\n:::\n' % (slug, caption, content)

    body = re.sub(
        r'<div id="t:([a-zA-Z0-9_-]+)" data-caption="([^"]*)" markdown="1">(.*?)</div>',
        table_div_repl,
        body,
        flags=re.DOTALL,
    )

    # Glob include: [%inc pat=GLOB fill="a b c" %] -> one {{< inc >}} per matched file.
    def pat_repl(m):
        pattern = m.group(1)
        fill = m.group(2)
        relpaths = sorted(os.path.relpath(f, chapter) for f in glob.glob(os.path.join(chapter, pattern)))
        parts = []
        for key in fill.split():
            for rp in relpaths:
                if key in os.path.basename(rp):
                    parts.append("{{< inc %s/%s >}}" % (chapter, rp))
                    break
        return "\n\n".join(parts)

    body = re.sub(r'\[%\s*inc\s+pat=(\S+)\s+fill="([^"]*)"\s*%\]', pat_repl, body)

    # Code include: [%inc FILE mark=NAME omit=NAME head="N" %] -> {{< inc CHAP/FILE ... >}}
    def inc_repl(m):
        file = m.group(1)
        rest = m.group(2).strip()
        path = "%s/%s" % (chapter, file)
        if rest:
            return "{{< inc %s %s >}}" % (path, rest)
        return "{{< inc %s >}}" % (path,)

    body = re.sub(r"\[%\s*inc\s+(\S+)([^%]*?)\s*%\]", inc_repl, body)

    # Line count: [%linecount FILE %] -> {{< linecount CHAP/FILE >}}
    def linecount_repl(m):
        return "{{< linecount %s/%s >}}" % (chapter, m.group(1))

    body = re.sub(r"\[%\s*linecount\s+(\S+)\s*%\]", linecount_repl, body)

    # Glossary reference: [%g term] / [%g term display] / [%g term "display"].
    def g_repl(m):
        term = m.group(1)
        disp = m.group(2)
        if disp:
            return "{{< g %s %s >}}" % (term, disp)
        return "{{< g %s >}}" % (term,)

    body = re.sub(r'\[%\s*g\s+("[^"]*"|\S+)(?:\s+("[^"]*"|\S+))?\s*%\]', g_repl, body)

    # Cross-references. Figures, tables, and chapters use Quarto's native crossref syntax.
    body = re.sub(r"\[%\s*x\s+(\S+)\s*%\]", r"@sec-\1", body)
    body = re.sub(r"\[%\s*f\s+(\S+)\s*%\]", r"@fig-\1", body)
    body = re.sub(r"\[%\s*t\s+(\S+)\s*%\]", r"@tbl-\1", body)

    def b_repl(m):
        return "[" + "; ".join("@" + k for k in m.group(1).split()) + "]"

    body = re.sub(r"\[%\s*b\s+([^%]+?)\s*%\]", b_repl, body)

    # External reference links [text][key] -> [text](@key).
    body = re.sub(r"\[([^\]]+)\]\[([^\]]+)\]", r"[\1](@\2)", body)

    # Heading identifiers: mccole's "{: #label}" -> pandoc's "{#label}".
    body = re.sub(r"\{\:\s*#([a-zA-Z0-9_-]+)\}", r"{#\1}", body)

    # Math: mccole writes "$ x $" with spaces; pandoc wants "$x$".
    body = re.sub(r"\$[ \t]+(.*?)[ \t]+\$", r"$\1$", body, flags=re.DOTALL)

    # Separate consecutive block shortcodes with a blank line (Quarto treats
    # consecutive shortcodes as inline, not block).
    body = re.sub(r"(>}})\n(\{\{<)", r"\1\n\n\2", body)

    # Emit the preserved front matter (abstract, syllabus, depends).
    front_out = {
        ("abstract-text" if k == "abstract" else k): v
        for k, v in front.items()
        if k in ("abstract", "syllabus", "depends") and v
    }

    out = ""
    if front_out:
        out += "---\n"
        out += yaml.safe_dump(front_out, default_flow_style=False, allow_unicode=True, sort_keys=False)
        out += "---\n\n"
    if title:
        out += "# " + title + " {#sec-" + chapter + "}\n\n"
    if front.get("syllabus"):
        out += "::: {.syllabus}\n"
        for item in front["syllabus"]:
            out += "- " + item + "\n"
        out += ":::\n\n"
    out += body.lstrip()

    os.makedirs(os.path.dirname(dst), exist_ok=True)
    with open(dst, "w", encoding="utf-8") as f:
        f.write(out)
    print("converted", src, "->", dst)


if __name__ == "__main__":
    for chapter in sys.argv[1:]:
        convert(chapter)
