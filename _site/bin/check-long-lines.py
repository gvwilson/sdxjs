#!/usr/bin/env python

'''Look for overly-long lines in file inclusions.'''

import sys

import utils

def check_long_lines(options):
    '''Main driver.'''
    found, problems = get_problems(options.sources)
    if found:
        report(options, problems)


def get_problems(filenames):
    '''Look for problems.'''
    found = False
    result = {}
    for filename in options.sources:
        result[filename] = []
        with open(filename, 'r') as reader:
            for (i, line) in enumerate(reader):
                if len(line.rstrip()) > utils.WIDTH:
                    found = True
                    result[filename].append(i+1)
    return found, result


def report(options, problems):
    '''Report any problems.'''
    print('- long lines')
    for filename in sorted(problems.keys()):
        if problems[filename]:
            if options.verbose:
                lines = ', '.join([str(i) for i in problems[filename]])
                print(f'  - {filename}: {lines}')
            else:
                print(f'  - {filename}: {len(problems[filename])}')


if __name__ == '__main__':
    options = utils.get_options(
        ['--sources', True, 'List of input files'],
        ['--verbose', None, 'Report line by line']
    )
    check_long_lines(options)
