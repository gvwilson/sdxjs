#!/usr/bin/env python

'''Convert YAML bibliography to Markdown.'''

import utils


# Top of page.
HEADER = '''---
nochaptertitle: true
---

<div class="bibliography">
'''

# Bottom of page.
FOOTER = '''

</div>
{% include sources.html %}
'''


def make_bib(options):
    '''Main driver.'''
    data = utils.read_yaml(options.input)
    entries = []
    for entry in data:
        assert 'kind' in entry, \
            f'Entries must have "kind": {entry}'
        assert entry['kind'] in HANDLERS, \
            f'Unknown entry kind {entry["kind"]}'
        text = HANDLERS[entry['kind']](entry)
        entries.append(text)
    entries = '\n'.join(entries)
    result = f'{HEADER}{entries}{FOOTER}'
    with open(options.output, 'w') as writer:
        writer.write(result)


def article(entry):
    '''Convert article.'''
    return '\n'.join([
        entry_start(entry),
        credit(entry),
        title(entry, True),
        article_info(entry),
        entry_end()
    ])


def book(entry):
    '''Convert book.'''
    return '\n'.join([
        entry_start(entry),
        credit(entry),
        title(entry, False),
        book_info(entry),
        entry_end()
    ])


def incollection(entry):
    '''Convert chapter in collection.'''
    return '\n'.join([
        entry_start(entry),
        credit(entry, which='author'),
        title(entry, True),
        'In ',
        credit(entry, which='editor'),
        book_title(entry),
        book_info(entry),
        entry_end()
    ])


def inproceedings(entry):
    '''Convert proceedings entry.'''
    return '\n'.join([
        entry_start(entry),
        credit(entry),
        title(entry, True),
        proceedings_info(entry),
        entry_end()
    ])


def link(entry):
    '''Convert link.'''
    return '\n'.join([
        entry_start(entry),
        credit(entry),
        title(entry, True),
        entry_end()
    ])


# Lookup table for entry handlers.
HANDLERS = {
    'article': article,
    'book': book,
    'incollection': incollection,
    'inproceedings': inproceedings,
    'link': link
}


def article_info(entry):
    '''Generate article information.'''
    assert ('journal' in entry) and ('year' in entry), \
        f'Entry requires journal and year: {str(entry)}'
    details = ''
    if 'volume' in entry:
        details = f'{entry["volume"]}'
    if 'number' in entry:
        details = f'{details}({entry["number"]})'
    if details:
        details = f', {details}'
    doi = f', <a class="doi" href="https://doi.org/{entry["doi"]}">{entry["doi"]}</a>' \
        if 'doi' in entry else ''
    return f'<em>{entry["journal"]}</em>{details}, {entry["year"]}{doi}.'


def book_info(entry):
    '''Generate book information.'''
    assert ('publisher' in entry) and ('year' in entry) and ('isbn' in entry), \
        f'Entry requires publisher, year, and ISBN: {entry}'
    return f'{entry["publisher"]}, {entry["year"]}, {entry["isbn"]}.'


def book_title(entry):
    '''Generate book title (possibly linking).'''
    assert 'booktitle' in entry, \
        'Entry must have booktitle'
    title = f'<a href="{entry["url"]}">{entry["booktitle"]}</a>' \
        if ('url' in entry) else entry["booktitle"]
    edition = f' ({entry["edition"]} edition)' \
        if ('edition' in entry) else ''
    return f'<em>{title}{edition}.</em>'


def proceedings_info(entry):
    '''Generate proceedings entry information.'''
    assert ('booktitle' in entry), \
        f'Entry requires booktitle {entry}'
    doi = f', <a class="doi" href="https://doi.org/{entry["doi"]}">{entry["doi"]}</a>' \
        if 'doi' in entry else ''
    return f'<em>{entry["booktitle"]}</em>{doi}.'


def credit(entry, which=None):
    '''Generate credit (author or editor if not specified).'''
    import sys
    names = None
    suffix = ''
    if which is None:
        if 'author' in entry:
            which = 'author'
        elif 'editor' in entry:
            which = 'editor'
    assert which, \
        f'Do not know author or editor for {entry}'
    if which == 'editor':
        suffix = ' (eds.)'
    names = entry[which]
    assert names is not None, \
        'Entry must have author or editor'
    if len(names) == 1:
        names = names[0]
    elif len(names) == 2:
        names = f'{names[0]} and {names[1]}'
    elif len(names) > 2:
        front = ', '.join(names[0:-1])
        names = f'{front}, and {names[-1]}'
    return f'{names}{suffix}:'


def title(entry, quote):
    '''Generate title (possibly linking and/or quoting).'''
    assert 'title' in entry, \
        f'Entry {entry} does not have title'
    title = f'<a href="{entry["url"]}">{entry["title"]}</a>' \
        if ('url' in entry) else entry["title"]
    title = f'"{title}"' if quote else f'<em>{title}</em>'
    edition = f' ({entry["edition"]} edition)' \
        if ('edition' in entry) else ''
    return f'{title}{edition}.'


def entry_start(entry):
    '''Generate bibliography key in start of entry.'''
    assert 'key' in entry, \
        'Every entry must have key'
    return f'<p id="{entry["key"]}" class="bibliography"><span class="bibliographykey">{entry["key"]}</span> '


def entry_end():
    '''Finish an entry.'''
    return '</p>\n'


if __name__ == '__main__':
    options = utils.get_options(
        ['--input', False, 'Path to input YAML bibliography file'],
        ['--output', False, 'Path to output Markdown file']
    )
    make_bib(options)
