{% if include.problem %}

1.  Write a program called `from-to.js` that takes the name of a directory
    and the name of a manifest file
    as its command-line arguments,
    then adds, removes, and/or renames files in the directory
    to restore the state described in the manifest.
    The program should only perform file operations when it needs to,
    e.g.,
    it should not delete a file and re-add it if the contents have not changed.

2.  Write some tests for `from-to.js` using Mocha and `mock-fs`.

{% else %}

FIXME: write solution.

{% endif %}
