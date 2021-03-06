#!/usr/bin/env python

'''Check that all code blocks have a type.'''

import re
import sys

import utils


# Known languages.
LANGUAGES = {
    'html',
    'make',
    'out',
    'python',
    'sh',
    'txt'
}

def check_code_blocks(options):
    '''Main driver.'''
    result = {}
    for filename in options.sources:
        problems = find_problems(filename)
        if problems:
            result[filename] = problems
    report(result)


def find_problems(filename):
    '''Find problems in a file.'''
    result = []
    in_code = False
    with open(filename, 'r') as reader:
        for (i, line) in enumerate(reader):
            if not line.startswith('```'):
                continue
            if in_code:
                in_code = False
            else:
                line = line.strip().replace('```', '', 1)
                if (not line) or (line not in LANGUAGES):
                    result.append(i+1)
                in_code = True
    return result


def report(result):
    '''Report problems if any.'''
    if result:
        print('- code blocks')
        for filename in sorted(result.keys()):
            print(f'  - {filename}')
            for ln in result[filename]:
                print(f'    - {ln}')


if __name__ == '__main__':
    options = utils.get_options(
        ['--sources', True, 'List of input files']
    )
    check_code_blocks(options)
