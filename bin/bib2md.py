#!/usr/bin/env python

'''
Convert a BibTeX file to Markdown.  This only handles the subset
of BibTeX used in this book's bibliography.
'''

# Libraries.
import sys
import bibtexparser

# Constants
HEADER = '''---
permalink: "/references/"
---

{:auto_ids}'''
FOOTER = '{% include links.md %}'
SEPARATOR = ':\n:   '
REINDENT = '\n    '


def _c(text):
    '''
    Clean up LaTeXisms in strings.
    '''
    return text\
        .replace('{', '')\
        .replace('}', '')\
        .replace(r'\%', '%')


def _authors(entry):
    '''
    Format the author names in an entry.
    '''
    if 'author' in entry:
        names = entry['author']
        suffix = ''
    elif 'editor' in entry:
        names = entry['editor']
        suffix = ' (eds.)'
    names = names.split(' and ')
    if len(names) == 0:
        raise Exception('NO AUTHOR')
    elif len(names) == 1:
        return _c('{}{}'.format(names[0], suffix))
    elif len(names) == 2:
        return _c('{} and {}{}'.format(names[0], names[1], suffix))
    else:
        return _c('{}, and {}{}'.format(', '.join(names[:-1]), names[-1], suffix))


def _booktitle(entry):
    '''
    Format the book title in an entry.
    '''
    if 'link' in entry:
        return _c('[*{}*]({})'.format(entry['booktitle'], entry['link']))
    else:
        return _c('*{}*'.format(entry['booktitle']))


def _details(entry):
    '''
    Format publication details: year plus optional month, volume, number.
    '''
    result = entry['year']
    if 'month' in entry:
        result = '{} {}'.format(entry['month'], result)
    if 'volume' in entry:
        if 'number' in entry:
            extra = '{}({})'.format(_c(entry['volume']), entry['number'])
        else:
            extra = _c(entry['volume'])
        result = '{}, {}'.format(extra, result)
    return result


def _doi(entry):
    '''
    Format a DOI in an entry.
    '''
    if 'doi' not in entry:
        return ''
    return 'doi:{}'.format(entry['doi'])


def _howpublished(entry):
    '''
    Format the 'howpublished' of a miscellaneous entry (possibly as a link).
    '''
    how = entry['howpublished']
    if how.startswith('http'):
        how = '<{}>'.format(how)
    return _c(how)

    
def _isbn(entry):
    '''
    Format an ISBN in an entry.
    '''
    if 'isbn' not in entry:
        return ''
    return entry['isbn']


def _journal(entry):
    '''
    Format a journal title.
    '''
    return _c('*{}*'.format(entry['journal']))

    
def _key(entry):
    '''
    Format the citation key, including the Markdown to create a linkable ID.
    '''
    return entry['ID']


def _note(entry):
    '''
    Format an entry's bibliographic note.
    '''
    return _c('*{}*'.format(entry['note']))


def _papertitle(entry):
    '''
    Format the title of a paper.
    '''
    if 'url' in entry:
        return _c('"[{}]({})"'.format(entry['title'], entry['url']))
    else:
        return _c('"{}"'.format(entry['title']))

    
def _publisher(entry):
    '''
    Format the publisher in an entry.
    '''
    return _c(entry['publisher'])


def _title(entry):
    '''
    Format the book title in an entry.
    '''
    if 'link' in entry:
        return _c('[*{}*]({})'.format(entry['title'], entry['link']))
    else:
        return _c('*{}*'.format(entry['title']))


def output(text):
    '''
    Display text with simple LaTeXisms removed.
    '''
    text = text.replace(r'\&', '&').replace(r'\ ', ' ')
    sys.stdout.write(text)


# Handlers for various entry types.
# Each element is either a function (always called) or a (prefix, function) pair.
# In the latter case, the prefix is only displayed if the function returns something.
HANDLERS = {
    'article' : [
        _key, SEPARATOR,
        _authors, ':', REINDENT,
        _papertitle, '.', REINDENT,
        _journal, (', ', _details), (', ', _doi), '.', REINDENT,
        _note
    ],
    'book' : [
        _key, SEPARATOR,
        _authors, ': ', REINDENT,
        _title, '.', REINDENT,
        _publisher, (', ', _details), (', ', _isbn), '.', REINDENT,
        _note
    ],
    'incollection' : [
        _key, SEPARATOR,
        _authors, ':', REINDENT,
        _papertitle, '.', REINDENT,
        'In ', _booktitle, ',', REINDENT,
        _publisher, (', ', _details), (', ', _doi), '.', REINDENT,
        _note
    ],
    'inproceedings' : [
        _key, SEPARATOR,
        _authors, ':', REINDENT,
        _papertitle, '.', REINDENT,
        'In ', _booktitle, (', ', _details), (', ', _doi), '.', REINDENT,
        _note
    ],
    'misc' : [
        _key, SEPARATOR,
        _authors, ':', REINDENT,
        _papertitle, '.', REINDENT,
        _howpublished, (', ', _details), (', ', _doi), '.', REINDENT,
        _note
    ]
}

def main():
    '''
    Main driver: read bibliography from stdin, format and print the entries to stdout.
    '''
    source = bibtexparser.loads(sys.stdin.read()).entries
    print(HEADER)
    try:
        for entry in source:
            for h in HANDLERS[entry['ENTRYTYPE']]:
                if type(h) is tuple:
                    prefix, func = h
                    text = func(entry)
                    if text:
                        output(prefix + text)
                elif callable(h):
                    output(h(entry))
                else:
                    output(h)
            output('\n\n')
    except Exception as e:
        sys.stderr.write('\nERROR {}:: {}\n'.format(str(e), str(entry)))
    print(FOOTER)


# Command-line launch.
if __name__ == '__main__':
    main()
