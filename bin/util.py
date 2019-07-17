import os
import yaml


def buildFilenames(args):
    '''
    Build filenames from YAML data.  Lessons, standard files, and
    extras have slightly different structures. 'args' must have
    keys 'lessons', 'standards', and 'extras'.
    '''

    # Introduction.
    intro = [{
        'inroot': True,
        'title': 'Introduction',
        'slug': 'intro',
        'path': 'index.md',
        'htmlPath': 'index.html'
    }]

    # Lessons.
    with open(args.lessons, 'r') as reader:
        lessons = yaml.load(reader, Loader=yaml.FullLoader)
        lessons = [{'slug': x['link'].strip('/'),
                    'path': f"{x['link'].strip('/')}/index.md",
                    'htmlPath': f"{x['link'].strip('/')}/index.html",
                    'title': x['name'],
                    'lede': x['lede']}
                   for x in lessons]

    # Standard files.
    with open(args.standards, 'r') as reader:
        standards = yaml.load(reader, Loader=yaml.FullLoader)
        standards = [{'slug': x['link'].strip('/'),
                      'path': x['path'],
                      'htmlPath': f"{x['link'].strip('/')}/index.html",
                      'title': x['name']}
                     for x in standards if 'path' in x]

    # Extra files (if present).
    if os.path.isfile(args.extras):
        with open(args.extras, 'r') as reader:
            extras = yaml.load(reader, Loader=yaml.FullLoader)
            if extras:
                extras = [{'slug':x['link'].strip('/'),
                           'path': f"{x['link'].strip('/')}/index.md",
                           'htmlPath': f"{x['link'].strip('/')}/index.html",
                           'title': x['name']}
                          for x in extras]
            else:
                extras = []

    return {
        'intro': intro,
        'lessons': lessons,
        'standards': standards,
        'extras': extras
    }
