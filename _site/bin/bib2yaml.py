#!/usr/bin/env python

'''Convert BibTeX entries to YAML.'''

import bibtexparser
import re
import sys
import yaml


# Keys to replace.
REPLACE = {
    'ENTRYTYPE': 'kind',
    'ID': 'key',
    'link': 'url'
}

# Things to remove.
REMOVE = {
    'local',
    'note'
}

# String definitions to add.
ADD = '''@string{jan = "1"}
@string{feb = "2"}
@string{mar = "3"}
@string{apr = "4"}
@string{may = "5"}
@string{jun = "6"}
@string{jul = "7"}
@string{aug = "8"}
@string{sep = "9"}
@string{oct = "10"}
@string{nov = "11"}
@string{dec = "12"}
'''

# Things to convert.
def number_if_possible(s):
    '''Convert to number or return original string.'''
    try:
        return int(s)
    except ValueError:
        return s

SPLIT = re.compile(r'\s+and\s+')
def split_names(s):
    '''Split names on 'and'.'''
    return SPLIT.split(s)

URL = re.compile(r'\\url{(.+)}')
def un_url(s):
    '''Remove URL macro.'''
    m = URL.match(s)
    return m.group(1) if m else s

CONVERT = {
    'author': split_names,
    'editor': split_names,
    'howpublished': un_url,
    'number': number_if_possible,
    'volume': number_if_possible,
    'year': number_if_possible
}


def bib2yaml():
    '''Main driver.'''
    text = ADD + sys.stdin.read()
    bib = bibtexparser.loads(text).entries
    bib = [cleanup(entry) for entry in bib]
    print(yaml.dump(bib, width=10000))


def cleanup(entry):
    '''Clean up an entry.'''

    for key in REPLACE:
        if key in entry:
            entry[REPLACE[key]] = entry[key]
            del entry[key]

    for key in REMOVE:
        if key in entry:
            del entry[key]

    for key in CONVERT:
        if key in entry:
            entry[key] = CONVERT[key](entry[key])

    for key in entry:
        if type(entry[key]) == str:
            entry[key] = unlatex(entry[key])

    return entry


def unlatex(s):
    '''Remove LaTeX isms.'''
    return s\
        .replace('{', '')\
        .replace('}', '')\
        .replace('\\', '')


if __name__ == '__main__':
    bib2yaml()
