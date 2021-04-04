#!/usr/bin/env python

'''Show FIXME markers by entry.'''

import re
import textwrap


import utils


FIXME = re.compile(r'<span\s+class="fixme">(.+?)</span>', re.DOTALL)


def show_fixme(options):
    '''Main driver.'''
    config = utils.read_yaml(options.config)
    print('Chapter | FIXME')
    print('------- | -----')
    for info in utils.get_entry_info(config):
        title = info['title']
        with open(info['file'], 'r') as reader:
            text = reader.read()
        for fixme in [m.group(1) for m in FIXME.finditer(text)]:
            lines = textwrap.wrap(fixme, width=utils.WIDTH, break_long_words=False)
            prefix = ''
            for line in lines:
                print(f'{title} | {prefix}{line}')
                title = ''
                prefix = '... '


if __name__ == '__main__':
    options = utils.get_options(
        ['--config', False, 'Path to YAML configuration file']
    )
    show_fixme(options)

