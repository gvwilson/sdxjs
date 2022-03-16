#!/usr/bin/env python

'''Build YAML cross-reference for figures.'''

import re

import utils


# Figure and table inclusion
FIG_INC = re.compile(r'{%\s+include\s+figure\b.+?id=["\'](.+?)["\'].+?%}', re.DOTALL)
TBL_INC = re.compile(r'{%\s+include\s+table\b.+?id=["\'](.+?)["\'].+?%}', re.DOTALL)


def make_numbering(options):
    '''Main driver.'''
    config = utils.read_yaml(options.config)
    entries = utils.get_entry_info(config)
    figures = {}
    tables = {}
    for entry in entries:
        text = utils.read_file(entry['file'], scrub=False)
        figures.update(get_inclusions(FIG_INC, entry, text))
        tables.update(get_inclusions(TBL_INC, entry, text))
    result = {
        'entries': entries,
        'figures': figures,
        'tables': tables
    }
    utils.write_yaml(options.output, result)


def get_inclusions(pattern, entry, text):
    '''Get all inclusions from file.'''
    label = entry['label']
    result = {}
    for (i, match) in enumerate(pattern.finditer(text)):
        key = match.group(1)
        result[key] = f'{label}.{i+1}'
    return result


if __name__ == '__main__':
    options = utils.get_options(
        ['--config', False, 'Path to YAML configuration file'],
        ['--output', False, 'Path to output YAML file']
    )
    make_numbering(options)
