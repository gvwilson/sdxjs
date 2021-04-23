#!/usr/bin/env python

'''Show FIXME markers by entry.'''

import re
import textwrap


import utils


FIXME = re.compile(r'<span\s+class="fixme">(.+?)</span>', re.DOTALL)


def show_fixme(options):
    '''Main driver.'''
    title_shown = False
    for filename in options.sources:
        with open(filename, 'r') as reader:
            text = reader.read()
        for fixme in [m.group(1) for m in FIXME.finditer(text)]:
            lines = textwrap.wrap(fixme, width=utils.WIDTH, break_long_words=False)
            if not lines:
                continue
            if not title_shown:
                print('Chapter | FIXME')
                print('------- | -----')
                title_shown = True
            prefix = ''
            for line in lines:
                print(f'{filename} | {prefix}{line}')
                title = ''
                prefix = '... '


if __name__ == '__main__':
    options = utils.get_options(
        ['--sources', True, 'Files to check']
    )
    show_fixme(options)

