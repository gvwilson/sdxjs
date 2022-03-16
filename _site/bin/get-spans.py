#!/usr/bin/env python

'''Show contents of all spans, flagging problematic ones.'''

import re

import utils


SPAN = re.compile(r'(<span.+?>.*?</span>)', re.DOTALL)
REASONABLE = 80


def get_spans(options):
    '''Main driver.'''
    print('- spans')
    for filename in options.sources:
        print(f'  - {filename}')
        with open(filename, 'r') as reader:
            text = reader.read()
        for match in SPAN.finditer(text):
            prefix = '-'
            m = match.group(1)
            if len(m) > REASONABLE:
                prefix = '*'
                m = m[:REASONABLE]
            print(f'    - {repr(m)}')


if __name__ == '__main__':
    options = utils.get_options(
        ['--sources', True, 'List of input files']
    )
    get_spans(options)
