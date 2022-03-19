#!/usr/bin/env python

'''Check that external links resolve.'''

import argparse
import re
import sys
import yaml

import utils


# References to links use `[text][link]`.
LINK_REF = re.compile(r'\[.+?\]\[(.+?)\]', re.DOTALL)


def check_links(options):
    '''Main driver.'''
    config = utils.read_yaml(options.config)
    defined = get_keys(config)
    referenced = utils.get_all_matches(LINK_REF, options.sources)
    utils.report('links', referenced=referenced, defined=defined)
    check_duplicates(options)


def get_keys(config):
    '''Create set of chapter slugs found in configuration.'''
    links = yaml.safe_load(config['kramdown']['link_defs'])
    return set(links.keys())


def check_duplicates(options):
    all_duplicates = {}
    for filename in options.sources:
        duplicates = []
        matches = utils.get_matches(LINK_REF, filename, duplicates=duplicates)
        if duplicates:
            all_duplicates[filename] = duplicates
    if all_duplicates:
        print('- duplicate links')
        for filename in sorted(all_duplicates.keys()):
            print(f'  - {filename}')
            for key in sorted(all_duplicates[filename]):
                print(f'    - {key}')


if __name__ == '__main__':
    options = utils.get_options(
        ['--config', False, 'Path to YAML configuration file'],
        ['--sources', True, 'List of input files']
    )
    check_links(options)
