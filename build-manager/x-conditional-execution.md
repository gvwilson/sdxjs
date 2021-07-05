Modify the build manager so that:

1.  The user can pass `variable=true` and `variable=false` arguments on the command-line
    to define variables.

2.  Rules can contain an `if: variable` field.

3.  Those rules are only executed if the variable is defined and true.

4.  Write Mocha tests to check that this works correctly.
