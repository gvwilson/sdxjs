#!/usr/bin/env python

'''Inventory attributes and values by element type in HTML.'''


import bs4

import utils


SKIP = {
    ('a',      'aria-label'),
    ('a',      'href'),
    ('a',      'title'),
    ('dt',     'id'),
    ('figure', 'id'),
    ('h1',     'key'),
    ('h2',     'id'),
    ('h3',     'id'),
    ('img',    'alt'),
    ('img',    'src'),
    ('link',   'href'),
    ('script', 'src'),
    ('span',   'f'),
    ('span',   'g'),
    ('span',   't'),
    ('span',   'x')
}

def list_html_attributes(options):
    '''Main driver.'''
    seen = {}
    for filename in options.sources:
        with open(filename, 'r') as reader:
            doc = bs4.BeautifulSoup(reader, features='lxml')
            do_doc(seen, doc)
    report(seen)


def do_doc(seen, doc):
    '''Recurse through document.'''
    for element in doc.descendants:
        if isinstance(element, bs4.element.Tag):
            if element.name not in seen:
                seen[element.name] = {}
            do_element(seen[element.name], element)


def do_element(attr_values, element):
    '''Handle individual element.'''
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
    '''Report results.'''
    for k in sorted(seen.keys()):
        attrs = seen[k]
        for a in sorted(attrs.keys()):
            if (k, a) not in SKIP:
                for v in sorted(seen[k][a]):
                    print(k, a, v)


if __name__ == '__main__':
    options = utils.get_options(
        ['--sources', True, 'List of input files']
    )
    list_html_attributes(options)
