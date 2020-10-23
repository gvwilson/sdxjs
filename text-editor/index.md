---
---

A terminal editor based on [Termit][termit] using [terminal-kit][terminal-kit].

-   Outline

<%- include('/inc/erase.html', {file: 'minimal.js', tag: 'body'}) %>

-   Constructor

<%- include('/inc/slice.html', {file: 'minimal.js', tag: 'constructor'}) %>

- And when we have to resize

<%- include('/inc/slice.html', {file: 'minimal.js', tag: 'resize'}) %>

- Drawing the title and status bar

<%- include('/inc/slice.html', {file: 'minimal.js', tag: 'drawbar'}) %>

- Drawing in general

<%- include('/inc/slice.html', {file: 'minimal.js', tag: 'draw'}) %>

- Handling keys

<%- include('/inc/slice.html', {file: 'minimal.js', tag: 'onkey'}) %>

- Handling newlines is special

<%- include('/inc/slice.html', {file: 'minimal.js', tag: 'newline'}) %>

-   And when the time comes to exit

<%- include('/inc/slice.html', {file: 'minimal.js', tag: 'exit'}) %>
