Create a command-line program called `sniff.js`
that checks for style violations in any number of source files.
The first command-line argument to `sniff.js` must be a JavaScript source file
that exports a class derived from `Walker` called `Check`
that implements the checks the user wants.
The other command-line arguments must be the names of JavaScript source files to be checked:

<%- include('/inc/code.html', {file: 'across-files/sniff.sh'}) %>
