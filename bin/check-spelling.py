#!/usr/bin/env python

'''Check for misspelled words.'''

import sys

import utils


def check_spelling(options):
    '''Main driver.'''
    actual = {word.strip() for word in sys.stdin.readlines()}
    expected = {word.strip() for word in open(options.compare, 'r').readlines()}
    utils.report('spelling', actual=actual, expected=expected)


if __name__ == '__main__':
    options = utils.get_options(
        ['--compare', False, 'File to compare wordlist']
    )
    check_spelling(options)
