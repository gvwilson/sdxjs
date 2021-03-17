#!/usr/bin/env python

'''Show section lengths.'''

import re


import utils


def show_sections(options):
    '''Main driver.'''
    config = utils.read_yaml(options.config)
    print('Chapter | Section | Words')
    print('------- | ------- | -----')
    for (title, filename) in get_entries(config):
        for (heading, words) in measure_sections(filename):
            print(f'{title} | {heading} | {words}')
            title = ''


def get_entries(config):
    '''Get titles and filenames.'''
    return [(entry['title'], entry['file'] if ('file' in entry) else f'./{entry["slug"]}/index.md')
            for entry in config['chapters']
            if 'appendix' not in entry]


def measure_sections(filename):
    '''Count words per level-2 section.'''
    with open(filename, 'r') as reader:
        text = reader.read()
    _, _, body = text.split('---', 2)
    lines = body.split('\n')
    result = []
    current = '...'
    count = 0
    for line in lines:
        if line.startswith('## '):
            result.append((current, count))
            current = line.replace('##', '').strip()
            count = 0
        else:
            count += len(line.split())
    result.append((current, count))
    return result


if __name__ == '__main__':
    options = utils.get_options(
        ['--config', False, 'Path to YAML configuration file']
    )
    show_sections(options)
