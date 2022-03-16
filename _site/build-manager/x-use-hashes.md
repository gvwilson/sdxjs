{% if include.problem %}

1.  Write a program called `build-init.js` that calculates a hash
    for every file mentioned in the build configuration
    and stores the hash along with the file's name in `build-hash.json`.

2.  Modify the build manager to compare the current hashes of files
    with those stored in `build-hash.json`
    in order to determine what is out of date,
    and to update `build-hash.json` each time it runs.

{% else %}

FIXME: write solution.

{% endif %}
