#!/usr/bin/env python

'''Check for code filtering tags in generated HTML.'''

import re
import sys

import utils

PAT = re.compile(r'//\s*\[.+?\]')


def check_filter_tags(options):
    '''Main driver.'''
    result = {}
    for filename in options.sources:
        problems = find_filter_tags(filename)
        if problems:
            result[filename] = problems
    if result:
        report(options, result)


def find_filter_tags(filename):
    '''Find code filter tags in generated HTML.'''
    with open(filename, 'r') as reader:
        text = reader.read()
        problems = [m.group(0) for m in PAT.finditer(text)]
        return problems

def report(options, problems):
    '''Report any problems.'''
    print('- code filtering tags')
    for filename in sorted(problems.keys()):
        print(f'  - {filename}')
        for p in problems[filename]:
            print(f'    - {p}')


if __name__ == '__main__':
    options = utils.get_options(
        ['--sources', True, 'List of input files']
    )
    check_filter_tags(options)
