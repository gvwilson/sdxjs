#!/usr/bin/env python

'''Merge Markdown bibliographies.'''

import sys
import yaml

import utils


KEY_ORDER = [
    'key',
    'type',
    'author',
    'title',
    'edition',
    'booktitle',
    'editor',
    'journal',
    'volume',
    'number',
    'month',
    'year',
    'doi',
    'isbn',
    'publisher',
    'url',
    'note'
]


CHARACTERS = {
    r'\u0103': 'ă',
    r'\xC5': 'Å',
    r'\xE1': 'á',
    r'\xE9': 'é',
    r'\xF3': 'ó',
    r'\xF6': 'ö'
}

INFINITE = 100000


def merge_bib_md(filenames):
    '''Main driver.'''
    combined = {}
    for fn in filenames:
        temp = utils.read_yaml(fn)
        for entry in temp:
            assert 'key' in entry, f'Entry {entry} from {fn} lacks key'
            combined[entry['key']] = entry
    combined = [combined[key] for key in sorted(combined.keys())]
    result = [reorder_keys(entry) for entry in combined]
    text = yaml.dump(result, sort_keys=False, width=INFINITE)
    for src in CHARACTERS:
        text = text.replace(src, CHARACTERS[src])
    text = text.replace('- key:', '\n- key:').lstrip()
    print(text)


def reorder_keys(entry):
    '''Create new dict for entry with keys in desired order.'''
    return {key:strip(entry[key]) for key in KEY_ORDER if key in entry}


def strip(value):
    '''Strip a string or all strings in a list.'''
    if type(value) == str:
        return value.strip()
    elif type(value) == list:
        return [x.strip() for x in value]
    return value


if __name__ == '__main__':
    merge_bib_md(sys.argv[1:])
