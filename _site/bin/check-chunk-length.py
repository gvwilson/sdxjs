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
    result = []
    with open(filename, 'r') as reader:
        text = reader.read()
        dom = BeautifulSoup(text, 'html.parser')
        for node in dom.find_all('pre'):
            try:
                length = len(node.code.string.split('\n'))
            except:
                assert False, f'pre node {node} has no text'
            if length > utils.LENGTH:
                entry = {'length': length, 'line': node.sourceline}
                if 'class' in node:
                    entry['class'] = node['class']
                if 'title' in node:
                    entry['title'] = node['title']
                result.append(entry)
    return result

def report(options, problems):
    '''Report any problems.'''
    print('- long chunks')
    for filename in sorted(problems.keys()):
        print(f'  - {filename}')
        for p in problems[filename]:
            print(f'    - line: {p["line"]}')
            print(f'      length: {p["length"]}')
            if 'class' in p:
                print(f'        class: {p["class"]}')
            if 'title' in p:
                print(f'        title: {p["title"]}')


if __name__ == '__main__':
    options = utils.get_options(
        ['--sources', True, 'List of input files']
    )
    check_chunk_length(options)
