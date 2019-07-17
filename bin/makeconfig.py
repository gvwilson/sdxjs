#!/usr/bin/env python

'''
Regenerate configuration file.
'''

import sys


def main():
    settings = dict([x.split('=', 1) for x in sys.argv[1:]])
    excludes = settings['excludes'].split()
    settings['excludes'] = '\n'.join([f'- "{x}"' for x in excludes])
    text = sys.stdin.read()
    text = text.format(**settings)
    print(text.rstrip())


if __name__ == '__main__':
    main()
