#!/usr/bin/env python

'''Convert a set of HTML pages to a single LaTeX document.'''

import re
import sys
from bs4 import BeautifulSoup, NavigableString, Tag

import utils


# Ignore these nodes and their children.
IGNORE = {
    'footer',
    'head',
    'nav'
}

# Do nothing with these nodes but get their children.
RECURSE_ONLY = {
    'body',
    '[document]',
    'header',
    'html',
    'main',
    'td',
    'th'
}

# Numbering (updated by main driver).
NUMBERING = {}


def html2tex(options):
    '''Main driver.'''
    update_numbering(options.numbering)
    config = utils.read_yaml(options.config)
    entries = get_filenames(options.site, config)
    accum = []
    for [kind, filename] in entries:
        if kind == 'entry':
            convert_file(filename, accum)
        elif kind == 'appendix':
            accum.append('\n\\appendix\n')
    result = ''.join(accum)
    display(options, config, result)


def update_numbering(filename):
    '''Update global numbering from saved data.'''
    global NUMBERING
    saved = utils.read_yaml(filename)
    for entry in saved['entries']:
        NUMBERING[entry['slug']] = entry['kind']


def get_filenames(site, config):
    '''Get names of input files from configuration data, marking the first appendix.'''
    result = []
    for entry in config['chapters']:
        if 'skip' in entry:
            pass
        elif 'slug' in entry:
            result.append(['entry', f"{site}/{entry['slug']}/index.html"])
        elif 'appendix' in entry:
            result.append(['appendix', None])
    return result


def convert_file(filename, accum):
    '''Translate a file from HTML to LaTeX.'''
    with open(filename, 'r') as reader:
        text = reader.read()
        dom = BeautifulSoup(text, 'html.parser')
        convert(dom.html, accum, True)
    return accum


def convert(node, accum, doEscape):
    '''Convert portion of tree to LaTeX, collecting text in accum.'''

    # Pure text
    if isinstance(node, NavigableString):
        accum.append(escape(node.string, doEscape))

    # Not a tag
    elif not isinstance(node, Tag):
        pass

    # Nothing to see here...
    elif node.name in IGNORE:
        pass

    # Ignore this but do its children
    elif node.name in RECURSE_ONLY:
        convert_children(node, accum, doEscape)

    # DOI reference
    elif (node.name == 'a') and has_class(node, 'doi'):
        link = escape(node['href'], doEscape)
        accum.append(rf'\href{{{link}}}{{{link}}}')

    # a => regular hyperlink
    elif node.name == 'a':
        link = escape(node['href'], doEscape)
        temp = ''.join(convert_children(node, [], doEscape))
        accum.append(rf'\hreffoot{{{temp}}}{{{link}}}')

    # blockquote => quotation
    elif node.name == 'blockquote':
        accum.append('\\begin{quotation}\n')
        convert_children(node, accum, doEscape)
        accum.append('\\end{quotation}\n')

    # br => line break
    elif node.name == 'br':
        accum.append(r' \\')

    # cite => cite
    elif node.name == 'cite':
        accum.append(r'\cite{')
        convert_children(node, accum, doEscape)
        accum.append('}')

    # code => typewriter text
    elif node.name == 'code':
        accum.append(r'\texttt{')
        convert_children(node, accum, doEscape)
        accum.append(r'}')

    # dd => just a paragraph in normal text, but remove internal links in glossary
    elif node.name == 'dd':
        temp = ''.join(convert_children(node, [], doEscape))
        temp = replace_internal_links(temp)
        accum.append(temp)
        accum.append('\n')

    # div callout
    elif (node.name == 'div') and has_class(node, 'callout'):
        accum.append('\\begin{callout}\n')
        convert_children(node, accum, doEscape)
        accum.append('\\end{callout}\n')

    # other div
    elif node.name == 'div':
        patch_bibliography(node) # needs special handling
        convert_children(node, accum, doEscape)

    # dl in bibliography => description list
    elif (node.name == 'dl') and has_class(node, 'bibliography'):
        accum.append(r'\begin{thebibliography}{ABCD}')
        convert_children(node, accum, doEscape)
        accum.append(r'\end{thebibliography}')

    # other dl
    elif node.name == 'dl':
        accum.append(r'\begin{description}')
        convert_children(node, accum, doEscape)
        accum.append(r'\end{description}')

    # dt in bibliography => description item
    elif (node.name == 'dt') and has_class(node, 'bibliography'):
        temp = ''.join(convert_children(node, [], doEscape))
        accum.append(rf'\bibitem[{temp}]{{{temp}}}')

    # dt in glossary
    elif (node.name == 'dt') and has_class(node, 'glossary'):
        key = escape(node['id'], True)
        temp = ''.join(convert_children(node, [], doEscape))
        accum.append(rf'\glossitem{{{key}}}{{{temp}}} ')

    # other dt
    elif (node.name == 'dt'):
        temp = ''.join(convert_children(node, [], doEscape))
        accum.append(rf'\item[{temp}] ')

    # em => italics
    elif node.name == 'em':
        accum.append(r'\emph{')
        convert_children(node, accum, doEscape)
        accum.append(r'}')

    # figure
    elif node.name == 'figure':
        convert_figure(node, accum)

    # h1 to be skipped
    elif (node.name == 'h1') and has_class(node, 'nochaptertitle'):
        pass

    # h1 => chapter title
    elif node.name == 'h1':
        assert node.has_attr('slug'), f'H1 {node} lacks slug'
        slug = node['slug']
        accum.append(r'\chapter{')
        convert_children(node, accum, doEscape)
        accum.append(r'}\label{')
        accum.append(slug)
        accum.append('}\n')

    # h2 chapter lede
    elif (node.name == 'h2') and has_class(node, 'lede'):
        temp = ''.join(convert_children(node, [], doEscape))
        accum.append(r'\chapterlede{')
        accum.append(temp)

        accum.append('}')
    # h2 => section title
    elif node.name == 'h2':
        accum.append(r'\section{')
        convert_children(node, accum, doEscape)
        accum.append('}\n')

    # h3 => subsection title
    elif node.name == 'h3':
        accum.append(r'\subsection*{')
        temp = ''.join(convert_children(node, [], doEscape))
        accum.append(temp.strip())
        accum.append('}\n')

    # list item
    elif node.name == 'li':
        accum.append(r'\item ')
        convert_children(node, accum, doEscape)
        accum.append('\n')

    # ordered list
    elif node.name == 'ol':
        accum.append('\\begin{enumerate}\n')
        convert_children(node, accum, doEscape)
        accum.append('\\end{enumerate}\n')

    # p => paragraph
    elif node.name == 'p':
        accum.append('\n')
        if has_class(node, 'noindent'):
            accum.append(r'\noindent')
            accum.append('\n')
        convert_children(node, accum, doEscape)
        accum.append('\n')

    # pre => preformatted text
    elif node.name == 'pre':
        title = ''
        if node.has_attr('title'):
            title = f'caption={{{node["title"]}}},captionpos=b,'
        child = node.contents[0]
        assert child.name == 'code', 'Expected code as child of pre'
        accum.append(f'\\begin{{lstlisting}}[{title}frame=single,frameround=tttt]\n')
        convert_children(child, accum, False)
        accum.append('\\end{lstlisting}\n')

    # strong => bold
    elif node.name == 'strong':
        accum.append(r'\textbf{')
        convert_children(node, accum, doEscape)
        accum.append(r'}')

    # fixme span
    elif (node.name == 'span') and has_class(node, 'fixme'):
        accum.append(r'\fixme{')
        convert_children(node, accum, doEscape)
        accum.append(r'}')

    # figure reference span
    elif (node.name == 'span') and node.has_attr('f'):
        key = node['f']
        accum.append(rf'\figref{{{key}}}')

    # table reference span
    elif (node.name == 'span') and node.has_attr('t'):
        key = node['t']
        accum.append(rf'\tblref{{{key}}}')

    # chapter/appendix cross-reference span
    elif (node.name == 'span') and node.has_attr('x'):
        key = node['x']
        if is_chapter(key):
            accum.append(rf'\chapref{{{key}}}')
        else:
            accum.append(rf'\appref{{{key}}}')

    # glossary and/or index span
    elif (node.name == 'span') and (node.has_attr('g') or node.has_attr('i')):
        convert_glossary_index(node, accum, doEscape)

    # some other kind of span
    elif node.name == 'span':
        convert_children(node, accum, doEscape)

    # links table
    elif (node.name == 'table') and has_class(node, 'links'):
        convert_links_table(node, accum)

    # table of bibliography sources
    elif (node.name == 'table') and node.has_attr('id') and (node['id'] == 'bibliography-sources'):
        convert_table(node, accum, placement='h')

    # some other kind of table
    elif node.name == 'table':
        convert_table(node, accum)

    # table of contents list
    elif (node.name == 'ul') and has_class(node, 'toc'):
        pass

    # other unordered list
    elif node.name == 'ul':
        accum.append('\\begin{itemize}\n')
        convert_children(node, accum, doEscape)
        accum.append('\\end{itemize}\n')

    # unrecognized
    else:
        print('UNKNOWN', node.name, file=sys.stderr)

    return accum


def convert_children(node, accum, doEscape):
    '''Handle the children of a node.'''
    for child in node:
        convert(child, accum, doEscape)
    return accum


def convert_figure(node, accum):
    '''Convert a figure.'''
    assert node.name == 'figure', 'Not a figure'
    label = node['id']
    slug = node['slug']
    path = node.img['src'].replace('.svg', '.pdf')
    if path.startswith('/'):
        path = f'.{path}'
    else:
        path = f'{slug}/{path}'
    alt = node.img['alt']
    caption = ''.join(convert_children(node.figcaption, [], True))
    accum.append(f'\\figpdf{{{label}}}{{{path}}}{{{caption}}}{{0.75}}')


def convert_glossary_index(node, accum, doEscape):
    '''Convert a span that is a glossary and/or index reference.'''
    assert node.name == 'span', 'Expected span'
    assert node.has_attr('g') or node.has_attr('i'), 'Expected "g" or "i"'

    if node.has_attr('g'):
        key = node['g']
        accum.append(r'\glossref{')
        convert_children(node, accum, doEscape)
        accum.append('}{')
        accum.append(key)
        accum.append('}')
    else:
        convert_children(node, accum, doEscape)

    if node.has_attr('i'):
        terms = [t.strip() for t in node['i'].split(';')]
        for term in terms:
            accum.append(fr'\index{{{escape(term, doEscape)}}}')


def convert_links_table(node, accum):
    '''Convert the end-table of links.'''
    accum.append('\\begin{description}\n')
    rows = node.tbody.find_all('tr')
    for row in rows:
        child = row.td.a
        link = escape(child['href'], True)
        text = ''.join(convert_children(child, [], True))
        accum.append(f'\n\n\\item[{text}] {link}')
    accum.append('\\end{description}\n')


def convert_table(node, accum, placement=None):
    '''Convert a table.'''
    assert node.name == 'table', 'Node is not a table'
    label = node['id'] if node.has_attr('id') else None
    placement = placement if placement is not None else ''

    assert node.tbody, f'Table node does not have body {node}'
    rows = [convert_table_row(row, 'td') for row in node.tbody.find_all('tr')]
    width = len(node.tbody.find('tr').find_all('td'))
    spec = 'l' * width

    thead = node.thead
    if thead:
        row = thead.tr
        assert row, f'Table head does not have row {node}'
        headers = node.thead.tr.find_all('th')
        assert headers, f'Table node does not have headers {node}'
        head = convert_table_row(node.thead.tr, 'th')
        rows = [head, *rows]

    if label:
        caption = ''.join(convert_children(node.caption, [], True))
        accum.append(f'\\begin{{table}}[{placement}]\n')

    accum.append(f'\\begin{{tabular}}{{{spec}}}\n')
    accum.append('\n'.join(rows))
    accum.append('\n\\end{tabular}\n')
    if label:
        accum.append(f'\\caption{{{caption}}}\n')
        accum.append(f'\\label{{{label}}}\n')
        accum.append('\\end{table}\n')


def convert_table_row(row, tag):
    '''Convert a single row of a table to a string.'''
    cells = row.find_all(tag)
    result = []
    for cell in cells:
        temp = convert(cell, [], True)
        result.append(''.join(temp))
    return ' & '.join(result) + r' \\'


def has_class(node, cls):
    '''Check if node has specified class.'''
    return node.has_attr('class') and (cls in node['class'])


def is_chapter(slug):
    '''Determine if a slug identifies a chapter or appendix.'''
    global NUMBERING
    assert slug in NUMBERING, f'Unknown slug for numbering {slug}'
    return NUMBERING[slug] == 'Chapter'


def add_class(node, cls):
    '''Add a class to a node.'''
    node['class'] = node.get('class', []) + [cls]


def display(options, config, text):
    '''Display translated files with header and footer.'''
    head = open(options.head, 'r').read()
    foot = open(options.foot, 'r').read()
    text = text\
        .replace('“', "``")\
        .replace('”', "''")\
        .replace('’', "'")
    head = head.replace(r'\title{TITLE}',
                        f'\\title{{{config["title"]}}}')
    subtitle = f'\\subtitle{{{config["subtitle"]}}}' \
        if 'subtitle' in config \
        else ''
    head = head.replace(r'\subtitle{SUBTITLE}', subtitle)
    print(head)
    print(text)
    print(foot)


def patch_bibliography(node):
    '''Patch the bibliography div.'''
    assert (node.name == 'div'), 'Expected div'
    if not has_class(node, 'bibliography'):
        return
    bib = node.dl
    add_class(bib, 'bibliography')
    for entry in bib.find_all('dt'):
        add_class(entry, 'bibliography')


def replace_internal_links(text):
    '''Replace internal links in glossary entries.'''
    HREFFOOT = re.compile(r'\\hreffoot\{(.+?)\}\{\\\#.+?\}')
    def replace(match):
        return f'\\textbf{{{match.group(1)}}}'
    return HREFFOOT.sub(replace, text)


def escape(text, doEscape):
    '''Escape special characters if asked to.'''
    if not doEscape:
        return text
    return text\
        .replace('\\', r'{\textbackslash}')\
        .replace('$', r'\$')\
        .replace(r'{\textbackslash}(', '$')\
        .replace(r'{\textbackslash})', '$')\
        .replace('%', r'\%')\
        .replace('_', r'\_')\
        .replace('^', r'{\textasciicircum}')\
        .replace('#', r'\#')\
        .replace('&', r'\&')\
        .replace('©', r'{\textcopyright}')\
        .replace('μ', r'{\textmu}')\
        .replace('…', '...')


if __name__ == '__main__':
    options = utils.get_options(
        ['--config', False, 'Path to YAML configuration file'],
        ['--foot', False, 'Path to LaTeX footer file'],
        ['--head', False, 'Path to LaTeX header file'],
        ['--numbering', False, 'Path to numbering file'],
        ['--site', False, 'Path to root directory of HTML site']
    )
    html2tex(options)
