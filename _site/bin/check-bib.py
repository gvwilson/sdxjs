#!/usr/bin/env python

'''Check consistency of bibliography definitions and references.'''

import argparse
import re
import sys

import utils


# Pattern that keys must match.
KEY = re.compile(r'^[A-Za-z]+\d{4}[a-z]?$')

def check_bib(options):
    '''Main driver.'''
    defined = get_definitions(options.bibliography)
    check_order(defined)
    check_keys(defined)
    cited = utils.get_all_matches(utils.CITATION, options.sources)
    utils.report('bibliography', cited=cited, defined=set(defined), checkOnlyRight=False)


def get_definitions(filename):
    '''Create set of citation keys.'''
    raw = utils.read_yaml(filename)
    result = []
    for entry in raw:
        assert 'key' in entry, f'Entry {entry} lacks key'
        result.append(entry['key'])
    return result


def check_order(keys):
    '''Make sure keys are in order.'''
    previous = None
    unordered = []
    for key in keys:
        if previous is not None:
            if key.lower() < previous:
                unordered.append(key)
        previous = key.lower()
    if unordered:
        print('- bibliography order')
        for key in unordered:
            print(f'  - {key}')


def check_keys(keys):
    '''Make sure all keys are name + 4-digit year.'''
    bad_keys = [k for k in keys if not KEY.match(k)]
    if bad_keys:
        print('- bibliography keys')
        for k in bad_keys:
            print(f'  - {k}')


if __name__ == '__main__':
    options = utils.get_options(
        ['--bibliography', False, 'Path to bibliography YAML file'],
        ['--sources', True, 'List of input files']
    )
    check_bib(options)
