Modify `backup.js` to load and run a function called `preCommit` from a file called `pre-commit.js`
stored in the root directory of the files being backed up.
If `preCommit` returns `true`, the backup proceeds;
if it returns `false` or throws an exception,
no backup is created.
