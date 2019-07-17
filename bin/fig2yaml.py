#!/usr/bin/env python

import argparse
import re
import string
import sys
import yaml

from util import buildFilenames


RAW_PAT = re.compile(r'{%\s+raw\s+%}.+?{%\s+endraw\s+%}')
FIGURE_PAT = re.compile(r'{%\s+include\s+figure.html\s+(.+?)%}', flags=re.DOTALL)
KEY_PAT = re.compile(r'key="(.+?)"')


def parseArgs():
    '''Parse command-line arguments.'''

    parser = argparse.ArgumentParser()
    parser.add_argument('--lessons', type=str, help='file containing lesson YAML')
    parser.add_argument('--standards', type=str, help='file containing standards YAML')
    parser.add_argument('--extras', type=str, help='file containing extras YAML')
    return parser.parse_args()


def indexToChapter(i):
    return i + 1


def indexToAppendix(i):
    return string.ascii_uppercase[i]


def update(contents, result, numberingFunc):
    for (i, entry) in enumerate(contents):
        with open(entry['path'], 'r') as reader:
            text = reader.read()
        text = RAW_PAT.sub('', text)
        matches = FIGURE_PAT.findall(text)
        for (figNum, match) in enumerate(matches):
            key = KEY_PAT.findall(match)[0]
            result.append({
                'key': f"f:{entry['slug']}:{key}",
                'number': f"{numberingFunc(i)}.{figNum+1}"
            })


def main():
    '''Main driver.'''

    args = parseArgs()
    content = buildFilenames(args)
    chapters = content['intro'] + content['lessons']
    appendices = content['standards'] + content['extras']
    result = []
    update(chapters, result, indexToChapter)
    update(appendices, result, indexToAppendix)
    yaml.dump(result, sys.stdout)


if __name__ == '__main__':
    main()
