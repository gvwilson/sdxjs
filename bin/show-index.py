#!/usr/bin/env python

'''Show index items.'''

import re

import utils


def show_index(options):
    '''Main driver.'''
    config = utils.read_yaml(options.config)
    terms = {}
    for info in utils.get_entry_info(config):
        find_terms(info['slug'], info['file'], terms)
    report(terms)


def find_terms(slug, filename, terms):
    '''Collect index terms from file.'''
    with open(filename, 'r') as reader:
        text = reader.read()
        for match in utils.INDEX_REF.finditer(text):
            entries = [e.strip() for e in utils.WHITESPACE.sub(' ', match.group(1)).split(';')]
            for entry in entries:
                if entry not in terms:
                    terms[entry] = []
            terms[entry].append(slug)


def report(terms):
    '''Show where terms are used.'''
    print('- index')
    for key in sorted(terms):
        sites = ', '.join(terms[key])
        print(f'  - {key}: {sites}')


if __name__ == '__main__':
    options = utils.get_options(
        ['--config', False, 'Path to YAML configuration file']
    )
    show_index(options)
