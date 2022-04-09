#!/usr/bin/env python

'''
Produce inventory of all attributes and values by element type in a
set of HTML documents.
'''

import sys
import bs4


UNREPORTED = {
    ('a', 'href'),
    ('dt', 'id'),
    ('figure', 'id'),
    ('h1', 'id'),
    ('h2', 'id'),
    ('img', 'alt'),
    ('img', 'src'),
    ('link', 'href'),
    ('script', 'src'),
    ('span', 'id'),
    ('span', 'key'),
    ('table', 'id'),
    ('td', 'align'),
    ('th', 'align')
}

def main(filenames):
    seen = {}
    for fn in filenames:
        with open(fn, 'r') as reader:
            doc = bs4.BeautifulSoup(reader, "html.parser")
            do_doc(seen, doc)
    report(seen)


def do_doc(seen, doc):
    for element in doc.descendants:
        if isinstance(element, bs4.element.Tag):
            if element.name not in seen:
                seen[element.name] = {}
            do_element(seen[element.name], element)


def do_element(attr_values, element):
    for attr in element.attrs:
        if attr not in attr_values:
            attr_values[attr] = set()
        value = element[attr]
        if isinstance(value, list):
            for v in value:
                attr_values[attr].add(v)
        else:
            attr_values[attr].add(value)


def report(seen):
    for tag in sorted(seen.keys()):
        print(f"- {tag}")
        for attr in sorted(seen[tag].keys()):
            if (tag, attr) not in UNREPORTED:
                print(f"  - {attr}: {', '.join(sorted(seen[tag][attr]))}")


if __name__ == '__main__':
    main(sys.argv[1:])
