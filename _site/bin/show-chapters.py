#!/usr/bin/env python

'''Show chapter lengths.'''

import re


import utils


def show_chapters(options):
    '''Main driver.'''
    config = utils.read_yaml(options.config)
    print('Chapter | Words')
    print('------- | -----')
    total = 0
    for info in utils.get_entry_info(config):
        title = info["title"]
        words = count_words(info["file"])
        total += words
        print(f'{title} | {words}')
    print('------- | -----')
    print(f'Total | {total}')


def count_words(filename):
    '''Count words in a file.'''
    with open(filename, 'r') as reader:
        text = reader.read()
    _, _, body = text.split('---', 2)
    return len(body.split())


if __name__ == '__main__':
    options = utils.get_options(
        ['--config', False, 'Path to YAML configuration file']
    )
    show_chapters(options)
