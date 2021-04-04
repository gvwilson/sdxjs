#!/usr/bin/env python

'''Check consistency of glossary definitions and references.'''

import re

import utils


# Keys in glossary entries.
GLOSS_KEYS = ['key']
GLOSS_SUBKEYS = ['term', 'def']
GLOSS_LANGUAGES = ['en']

# Cross-references look like internal links.
CROSS_REF = re.compile(r'\[.+?\]\((#.+?)\)', re.DOTALL)


def check_gloss(options):
    '''Main driver.'''
    glossary = utils.read_yaml(options.glossary)
    check_keys(glossary, options.language)
    check_order(glossary, options.language)
    defined = get_definitions(glossary)
    referenced = utils.get_all_matches(utils.GLOSS_REF, options.sources, no_duplicates=True)
    referenced |= get_internal(glossary, options.language)
    utils.report('glossary', referenced=referenced, defined=defined)


def check_keys(glossary, language):
    '''Check that every entry has the required keys.'''
    errors = []
    for entry in glossary:
        for key in GLOSS_KEYS:
            if key not in entry:
                errors.append(f'entry {entry} missing key {key}')
        if language not in entry:
            errors.append(f'entry {entry} missing language {language}')
        else:
            for key in GLOSS_SUBKEYS:
                if key not in entry[language]:
                    errors.append(f'entry {entry} missing subkey {key} for language {language}')
    if errors:
        print('- glossary')
        print('  - missing keys')
        for message in errors:
            print(f'    - {message}')


def check_order(glossary, language):
    '''Check that entries are in alphabetical order for the given language.'''
    previous = None
    unordered = []
    for entry in glossary:
        if previous is not None:
            if entry[language]['term'].lower() < previous[language]['term'].lower():
                unordered.append(entry['key'])
        previous = entry
    if unordered:
        print('- glossary')
        print('  - out of order')
        for item in unordered:
            print(f'    - {item}')


def get_internal(glossary, language):
    '''Create set of internal references within glossary definitions.'''
    result = set()
    for entry in glossary:
        for match in CROSS_REF.finditer(entry[language]['def']):
            result.add(match.group(1).lstrip('#'))
        if 'ref' in entry:
            result.update(entry['ref'])
    return result


def get_definitions(glossary):
    '''Create set of keys in glossary.'''
    return {entry['key'] for entry in glossary}


if __name__ == '__main__':
    options = utils.get_options(
        ['--glossary', False, 'Path to glossary YAML file'],
        ['--language', False, 'Two-letter code for language'],
        ['--sources', True, 'List of input files']
    )
    check_gloss(options)
