#!/usr/bin/env python
'''
Check that all links resolve.
Usage: checklinks.py /path/to/_config.yml /path/to/source_file.md ...
'''

import sys
import re
import yaml


RAW = re.compile(r'{%-?\s+raw\s+-?%}.+?{%-?\s+endraw\s+-?%}')
LINK_USE = re.compile(r'\[.+?\]\[(.+?)\]')


def main(links_path, terms_path, file_paths):
    '''
    Main driver.
    '''
    defined = set(config_select(links_path, 'slug')) | \
              set(config_select(terms_path, 'slug'))
    used = set()
    [used.update(get_links(f)) for f in file_paths]
    report('not defined', used - defined)
    report('not used', defined - used)


def config_select(file_path, field):
    '''
    Select a field from a YAML configuration file's entries.
    '''
    with open(file_path, 'r') as reader:
        config = yaml.load(reader, Loader=yaml.FullLoader)
    return [x[field] for x in config]


def get_links(file_path):
    '''
    Get link uses from file.
    '''
    with open(file_path, 'r') as reader:
        data = reader.read()
    data = RAW.sub('', data)
    return set(LINK_USE.findall(data))


def report(title, values):
    '''
    Display values if any.
    '''
    if values:
        print(title)
        for v in sorted(values):
            print('  {}'.format(v))


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2], sys.argv[3:])
