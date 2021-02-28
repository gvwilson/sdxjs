#!/usr/bin/env python

'''Check chapter cross-references.'''

import argparse
import re
import sys

import utils


# Chapter and appendix references use <span c="..."></span> and <span a="..."></span>.
CHAP_REF = re.compile(r'<span\s+(a|c)="(.+?)">', re.DOTALL)


def check_ref(options):
    '''Main driver.'''
    config = utils.read_yaml(options.config)
    defined = get_slugs(config)
    referenced = utils.get_all_matches(CHAP_REF, options.sources, group=2)
    utils.report('cross-references', checkOnlyRight=False, referenced=referenced, defined=defined)


def get_slugs(config):
    '''Create set of chapter slugs found in configuration.'''
    return {entry['slug'] for entry in config['chapters'] if 'slug' in entry}


if __name__ == '__main__':
    options = utils.get_options(
        ['--config', False, 'Path to YAML configuration file'],
        ['--sources', True, 'List of input files']
    )
    check_ref(options)
