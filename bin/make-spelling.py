#!/usr/bin/env python

'''Check for misspelled words.'''

import re
from spellchecker import SpellChecker

import utils


def make_spelling(options):
    '''Main driver.'''
    spell = SpellChecker()
    unknown = set()
    for filename in options.sources:
        words = utils.get_words(filename)
        unknown.update(spell.unknown(words))
    for word in sorted(unknown):
        print(f'- {word}')


if __name__ == '__main__':
    options = utils.get_options(
        ['--sources', True, 'List of input files']
    )
    make_spelling(options)
