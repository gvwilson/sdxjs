#!/usr/bin/env python

'''Make the YAML file listing terms defined in each chapter.'''

import utils


def make_terms(options):
    '''Main driver.'''
    config = utils.read_yaml(options.config)
    glossary = utils.read_yaml(options.glossary)
    glossary = convert_to_dict(glossary)
    per_file = get_all_keys(config)
    terms = keys_to_terms(glossary, options.language, per_file)
    utils.write_yaml(options.output, terms)


def convert_to_dict(data):
    '''Convert a list to a dictionary based on key.'''
    result = {}
    for entry in data:
        result[entry['key']] = entry
    return result


def get_all_keys(config):
    '''Get all terms, returning a dictionary of sets indexed by slug.'''
    result = {}
    for entry in utils.get_entry_info(config):
        result[entry['slug']] = utils.get_matches(utils.GLOSS_REF, entry['file'])
    return result


def keys_to_terms(glossary, language, per_file):
    '''Fill in glossary references per file.'''
    result = {}
    for slug in per_file:
        result[slug] = [{'key': key, 'term': glossary[key][language]['term']}
                        for key in per_file[slug]]
    return result


if __name__ == '__main__':
    options = utils.get_options(
        ['--config', False, 'Path to YAML configuration file'],
        ['--glossary', False, 'Path to glossary YAML file'],
        ['--language', False, 'Two-letter language code'],
        ['--output', False, 'Path to output YAML file']
    )
    make_terms(options)
