#!/usr/bin/env python

'''Check the structure of the generated HTML.'''


import sys
import bs4

import utils


KNOWN = {
    'a': {'aria-label', 'class', 'href', 'title'},
    'blockquote': {},
    'body': {'class'},
    'br': {},
    'caption': {},
    'cite': {},
    'code': {'class'},
    'dd': {'class'},
    'div': {'class', 'id'},
    'dl': {'class'},
    'dt': {'class', 'id'},
    'em': {},
    'figcaption': {},
    'figure': {'class', 'id', 'slug'},
    'footer': {},
    'h1': {'class', 'slug'},
    'h2': {'class', 'id'},
    'h3': {'id'},
    'head': {},
    'header': {},
    'hr': {},
    'html': {'lang'},
    'i': {'aria-hidden', 'class'},
    'img': {'alt', 'class', 'src'},
    'li': {},
    'link': {'href', 'rel', 'type'},
    'main': {},
    'meta': {'charset', 'content', 'name'},
    'nav': {'class'},
    'ol': {},
    'p': {'class', 'id'},
    'pre': {'class', 'title'},
    'script': {'async', 'crossorigin', 'src', 'type'},
    'small': {},
    'span': {'class', 'f', 'g', 'i', 't', 'x'},
    'strong': {},
    'table': {'class', 'id'},
    'tbody': {},
    'td': {'style'},
    'th': {'style'},
    'thead': {},
    'time': {'datetime'},
    'title': {},
    'tr': {},
    'ul': {'class'}
}


def check_dom(options):
    '''Main driver.'''
    elements = set()
    attributes = {}
    for filename in options.sources:
        with open(filename, 'r') as reader:
            doc = bs4.BeautifulSoup(reader, features='lxml')
            for node in doc.descendants:
                if isinstance(node, bs4.element.Tag):
                    check(elements, attributes, node)
    report(elements, attributes)


def check(elements, attributes, node):
    '''Check individual element.'''
    if node.name not in KNOWN:
        elements.add(node.name)
        return
    for attr in node.attrs:
        if attr not in KNOWN[node.name]:
            if node.name not in attributes:
                attributes[node.name] = set()
            attributes[node.name].add(attr)


def report(elements, attributes):
    '''Report results.'''
    if (not elements) and (not attributes):
        return
    print('- unknown')
    if elements:
        print('  - elements')
        for name in sorted(elements):
            print(f'    - {name}')
    if attributes:
        print('  - attributes')
        for name in sorted(attributes.keys()):
            print(f'    - {name}')
            for attr in sorted(attributes[name]):
                print(f'      - {attr}')


if __name__ == '__main__':
    options = utils.get_options(
        ['--sources', True, 'List of input files']
    )
    check_dom(options)
