1.  Modify `backup.js` so that it can save JSON manifests as well as CSV manifests
    based on a command-line flag.

2.  Write another program called `migrate.js` that converts a set of manifests
    from CSV to JSON.
    (The program's name comes from the term <span g="data_migration">data migration</span>.)

3.  Modify `backup.js` programs so that each manifest stores the user name of the person who created it
    along with file hashes,
    and then modify `migrate.js` to transform old files into the new format.
