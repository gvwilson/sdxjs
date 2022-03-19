{% if include.problem %}

Write a program `compare-manifests.js` that reads two manifest files and reports:

-   Which files have the same names but different hashes
    (i.e., their contents have changed).
-   Which files have the same hashes but different names
    (i.e., they have been renamed).
-   Which files are in the first hash but neither their names nor their hashes are in the second
    (i.e., they have been deleted).
-   Which files are in the second hash but neither their names nor their hashes are in the first
    (i.e., they have been added).

{% else %}

FIXME: write solution.

{% endif %}
