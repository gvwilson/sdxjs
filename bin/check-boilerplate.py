#!/usr/bin/env python

'''Check boilerplate files.'''


import utils


def check_boilerplate(options):
    '''Main driver.'''
    config = utils.read_yaml(options.config)
    result = check_license(config, options.license)
    if result:
        print('- boilerplate')
        for line in result:
            print(line)


def check_license(config, filename):
    '''Check the license file.'''
    result = []
    with open(filename, 'r') as reader:
        text = reader.read()
    if '<URL>' in text:
        result.append(f'  - license file {filename} contains <URL>')
    expected = f'<{config["url"]}>'
    if expected not in text:
        result.append(f'  - license file {filename} does not contain {expected}')
    return result

if __name__ == '__main__':
    options = utils.get_options(
        ['--config', False, 'Path to YAML configuration file'],
        ['--license', False, 'Path to license file']
    )
    check_boilerplate(options)
