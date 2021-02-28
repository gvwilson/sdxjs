#!/usr/bin/env python

'''Check for misspelled words.'''

import re
from spellchecker import SpellChecker

import utils


def check_spelling(options):
    '''Main driver.'''
    spell = SpellChecker()
    compare = utils.read_yaml(options.compare)
    spell.word_frequency.load_words(compare)
    title_shown = False
    for filename in options.sources:
        words = utils.get_words(filename)
        unknown = spell.unknown(words)
        if unknown:
            report(title_shown, filename, unknown)
            title_shown = True


def report(title_shown, filename, words):
    '''Display report.'''
    if not title_shown:
        print('- misspelled')
    print(f'  - {filename}')
    for word in sorted(words):
        print(f'    - {word}')


if __name__ == '__main__':
    options = utils.get_options(
        ['--compare', False, 'File to compare wordlist'],
        ['--sources', True, 'List of input files']
    )
    check_spelling(options)
