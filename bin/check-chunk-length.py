#!/usr/bin/env python

'''Check length of included code chunks.'''

import sys
from bs4 import BeautifulSoup

import utils


def check_chunk_length(options):
    '''Main driver.'''
    result = {}
    for filename in options.sources:
        problems = find_lengths(filename)
        if problems:
            result[filename] = problems
    if result:
        report(options, result)


def find_lengths(filename):
    '''Find lengths of code inclusions in file.'''
    with open(filename, 'r') as reader:
        text = reader.read()
        dom = BeautifulSoup(text, 'html.parser')
        code = [node.code.string for node in dom.find_all('pre')]
        lengths = [len(c.split('\n')) for c in code if c]
        return [x for x in lengths if x > utils.LENGTH]

def report(options, problems):
    '''Report any problems.'''
    print('- long chunks')
    for filename in sorted(problems.keys()):
        if options.verbose:
            print(f'  - {filename}')
            for p in problems[filename]:
                print(f'    - {p}')
        else:
            print(f'  - file: {filename}\n    number: {len(problems[filename])}')


if __name__ == '__main__':
    options = utils.get_options(
        ['--sources', True, 'List of input files'],
        ['--verbose', None, 'Report line by line']
    )
    check_chunk_length(options)
