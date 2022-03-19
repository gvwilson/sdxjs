#!/usr/bin/env python

'''Merge Markdown glossaries.'''

import sys
import yaml

import utils


LANGUAGE_ORDER = [
    'en'
]

KEY_ORDER = [
    'key',
    'ref',
    *LANGUAGE_ORDER
]

SUBKEY_ORDER = [
    'term',
    'acronym',
    'def'
]

INFINITE = 100000


def merge_gloss_md(filenames):
    '''Main driver.'''
    merged = merge_inputs(options)
    ordered = [merged[key] for key in sorted(merged.keys())]
    cleaned = [cleanup(options, entry) for entry in ordered]
    raw = yaml.dump(cleaned, sort_keys=False, width=utils.YAML_INFINITE)
    cooked = utils.cook_yaml(raw)
    print(cooked)


def merge_inputs(options):
    '''Read all files, merging inputs.'''
    result = {}
    for fn in options.sources:
        temp = utils.read_yaml(fn)
        for entry in temp:
            assert 'key' in entry, f'Entry {entry} from {fn} lacks key'
            if options.verbose and (entry['key'] in result):
                print(f'duplicate key {entry["key"]} in {fn}', file=sys.stderr)
            result[entry['key']] = entry
    return result


def cleanup(options, entry):
    '''Create new dict for entry with keys in desired order.'''
    temp = {}
    for key in KEY_ORDER:
        if key not in entry:
            pass
        elif (key in LANGUAGE_ORDER) and (key in options.languages):
            assert key in entry, f'Entry {entry} lacks language {key}'
            temp[key] = {k:utils.strip_nested(entry[key][k])
                         for k in SUBKEY_ORDER
                         if k in entry[key]}
        else:
            temp[key] = utils.strip_nested(entry[key])
    return temp


if __name__ == '__main__':
    options = utils.get_options(
        ['--languages', True, 'List of two-letter language codes'],
        ['--sources', True, 'List of input files'],
        ['--verbose', None, 'Report duplicate keys?']
    )
    merge_gloss_md(options)
