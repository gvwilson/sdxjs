#!/usr/bin/env python

import re

import utils


# Patterns to extract page numbers from .aux file.
BIB_LINE = re.compile(r'\\@writefile{toc}{\\contentsline\s+{fm}{Bibliography}{(.+?)}')
CHAP_LINE = re.compile(r'\\@writefile{toc}{\\contentsline\s+{chapter}{\\numberline\s+{(.+?)}(.+?)}{(.+?)}')
END_LINE = re.compile(r'\\gdef\s+\\@abspage@last{(.+?)}')


def count_pages(options):
    '''Main driver.'''
    with open(options.input, 'r') as reader:
        lines = reader.readlines()
    matches = [interesting(line) for line in lines]
    filtered = [entry for entry in matches if entry is not None]
    print('Index | Title | Pages')
    print('----- | ----- | -----')
    for i in range(len(filtered) - 1):
        pages = filtered[i+1]['page'] - filtered[i]['page']
        index = filtered[i]['index'] if filtered[i]['index'] is not None else ''
        name = filtered[i]['name']
        print(f'{index} | {name} | {pages}')
    print('----- | ----- | -----')
    total = filtered[-1]['page']
    print(f' | Total | {total}')


def interesting(line):
    '''Determine if a line is interesting for page count purposes.'''
    for func in [chapter, bibliography, end]:
        match = func(line)
        if match:
            return match
    return None


def bibliography(line):
    '''Check if this line is the bibliography entry.'''
    match = BIB_LINE.match(line)
    if not match:
        return None
    return {'kind': 'bibliography',
            'index': None,
            'name': 'Bibliography',
            'page': int(match.group(1))}


def chapter(line):
    '''Check if this line is a chapter entry.'''
    match = CHAP_LINE.match(line)
    if not match:
        return None
    kind = 'chapter' if match.group(1).isnumeric() else 'appendix'
    return {kind: kind,
            'index': match.group(1),
            'name': match.group(2),
            'page': int(match[3])}


def end(line):
    '''Check if this line is the end.'''
    match = END_LINE.match(line)
    if not match:
        return None
    return {'kind': 'end',
            'index': None,
            'name': None,
            'page': int(match.group(1))}


if __name__ == '__main__':
    options = utils.get_options(
        ['--input', False, 'Path to LaTeX .aux file']
    )
    count_pages(options)
