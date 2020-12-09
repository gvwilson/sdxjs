Suppose that `main.js` contains this:

<%- include('/inc/file.html', {file: 'x-refactoring-circularity/main.js'}) %>

::: continue
and `plugin.js` contains this:
:::

<%- include('/inc/file.html', {file: 'x-refactoring-circularity/plugin.js'}) %>

::: continue
Refactor this code so that it works correctly while still using `require` rather than `import`.
:::
