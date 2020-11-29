Suppose that `main.js` contains this:

<%- include('/_inc/file.html', {file: 'x-refactoring-circularity/main.js'}) %>

::: unindented
and `plugin.js` contains this:
:::

<%- include('/_inc/file.html', {file: 'x-refactoring-circularity/plugin.js'}) %>

::: unindented
Refactor this code so that it works correctly while still using `require` rather than `import`.
:::
