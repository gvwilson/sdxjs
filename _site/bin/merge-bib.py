#!/usr/bin/env python

'''Merge Markdown bibliographies.'''

import sys
import yaml

import utils


KEY_ORDER = [
    'key',
    'kind',
    'author',
    'title',
    'edition',
    'booktitle',
    'editor',
    'journal',
    'volume',
    'number',
    'pages',
    'month',
    'year',
    'doi',
    'isbn',
    'publisher',
    'url',
    'note'
]


def merge_bib(options):
    '''Main driver.'''
    merged = merge_inputs(options)
    ordered = [merged[key] for key in sorted(merged.keys())]
    check_keys(ordered)
    cleaned = [cleanup(entry) for entry in ordered]
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
            if entry['key'] not in result:
                result[entry['key']] = entry
            elif deep_equal(result[entry['key']], entry):
                pass
            elif options.verbose:
                print(f'duplicate key {entry["key"]} in {fn}', file=sys.stderr)
    return result


def deep_equal(left, right):
    '''Deep equality.'''
    if type(left) != type(right):
        return False
    elif type(left) == list:
        for (i, left_item) in enumerate(left):
            if not deep_equal(left_item, right[i]):
                return False
        return True
    elif type(left) == dict:
        if len(left.keys()) != len(right.keys()):
            return False
        for key in left:
            if (key not in right) or not deep_equal(left[key], right[key]):
                return False
        return True
    return left == right


def check_keys(entries):
    '''Check for unknown keys while merging.'''
    known = set(KEY_ORDER)
    for entry in entries:
        assert all([k in known for k in entry.keys()]), \
            f'Unknown key(s) in {entry}: {[k for k in entry.keys() if k not in known]}'


def cleanup(entry):
    '''Create new dict for entry with keys in desired order.'''
    return {key:utils.strip_nested(entry[key])
            for key in KEY_ORDER
            if key in entry}


if __name__ == '__main__':
    options = utils.get_options(
        ['--sources', True, 'List of input files'],
        ['--verbose', None, 'Report duplicate keys?']
    )
    merge_bib(options)
