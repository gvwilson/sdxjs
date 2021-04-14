#!/usr/bin/env python

'''Make HTML version of index.'''


import utils


def make_index(options):
    '''Main driver.'''
    config = utils.read_yaml(options.config)
    entries = utils.get_entry_info(config)
    index = {}
    for entry in entries:
        collect_index_entries(entry['file'], entry['slug'], index)
    index = rearrange(entries, index)
    utils.write_yaml(options.output, index)


def collect_index_entries(filename, slug, index):
    '''Accumulate index entries.'''
    with open(filename, 'r') as reader:
        text = reader.read()
        for match in utils.INDEX_REF.finditer(text):
            terms = [utils.WHITESPACE.sub(' ', t).strip().replace('!', ' - ')
                     for t in match.group(1).split(';')]
            for term in terms:
                if term not in index:
                    index[term] = set()
                index[term].add(slug)


def rearrange(entries, index):
    '''Convert dictionary index to list index.'''
    keys = [(key.lower(), key) for key in index.keys()]
    keys.sort()
    keys = [x[1] for x in keys]
    result = []
    for key in keys:
        links = [{'slug': entry['slug'], 'title': entry['title']} for entry in entries if entry['slug'] in index[key]]
        result.append({
            'term': key,
            'links': links
        })
    return result


if __name__ == '__main__':
    options = utils.get_options(
        ['--config', False, 'Path to YAML configuration file'],
        ['--output', False, 'Path to output YAML file']
    )
    make_index(options)
