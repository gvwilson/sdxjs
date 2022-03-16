#!/usr/bin/env python

'''Check that all code blocks have a type.'''

import re
import sys

import utils


def check_code_blocks(options):
    '''Main driver.'''
    config = utils.read_yaml(options.config)
    filenames = [entry['file'] for entry in utils.get_entry_info(config)]
    result = {}
    for filename in filenames:
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
                if (not line) or (line not in utils.LANGUAGES):
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
        ['--config', False, 'Path to YAML configuration file']
    )
    check_code_blocks(options)
