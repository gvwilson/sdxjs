#!/usr/bin/env python

"""Copy all generated HTML files in the right order."""

import bs4
import os
import shutil

import utils


def copy_in_order(options):
    config = utils.read_yaml(options.config)
    slugs = [c['slug'] for c in config['chapters'] if 'slug' in c]
    for (i, slug) in enumerate(slugs):
        src = os.path.join(options.site, slug, 'index.html')
        content = get_content(src)
        dst = os.path.join(options.dest, f'{i:02d}-{slug}.html')
        with open(dst, 'w') as writer:
            writer.write(content)


def get_content(src):
    with open(src, 'r') as reader:
        doc = bs4.BeautifulSoup(reader, features='lxml')
        header = doc.find_all('header')
        assert len(header) == 1
        main = doc.find_all('main')
        assert len(main) == 1
        return str(header[0]) + str(main[0])


if __name__ == '__main__':
    options = utils.get_options(
        ['--config', False, 'Path to YAML configuration file'],
        ['--dest', False, 'Path to output directory'],
        ['--site', False, 'Root directory of existing files']
    )
    copy_in_order(options)

