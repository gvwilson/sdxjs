---
---

-   A terminal editor based on [Termit][termit] using [terminal-kit][terminal-kit]
-   We are going to refactor an existing editor rather than writing something from scratch
    -   Means that we'll see the entire status bar right from the start
    -   And will gloss over some technical details, since this isn't a lesson on terminal management
-   But will see:
    -   How to build a <g key="plugin_architecture">plugin architecture</g>
    -   How to implement undo and redo

## What does a minimal text editor contain?

-   Outline

<%- include('/inc/erase.html', {file: 'minimal-editor.js', tag: 'body'}) %>

-   Constructor

<%- include('/inc/slice.html', {file: 'minimal-editor.js', tag: 'constructor'}) %>

- And when we have to resize

<%- include('/inc/slice.html', {file: 'minimal-editor.js', tag: 'resize'}) %>

- Drawing the title and status bar

<%- include('/inc/slice.html', {file: 'minimal-editor.js', tag: 'drawbar'}) %>

- Drawing in general

<%- include('/inc/slice.html', {file: 'minimal-editor.js', tag: 'draw'}) %>

- Handling keys

<%- include('/inc/slice.html', {file: 'minimal-editor.js', tag: 'onkey'}) %>

- Handling newlines is special

<%- include('/inc/slice.html', {file: 'minimal-editor.js', tag: 'newline'}) %>

-   And when the time comes to exit

<%- include('/inc/slice.html', {file: 'minimal-editor.js', tag: 'exit'}) %>

## How can we make the editor extensible?

-   Even a minimalist editor like [Nano][nano] has many special keys
-   Programmers often want to add more or change the <g key="key_binding">bindings</g> of existing keys
-   Best solution is a <g key="plugin_architecture">plugin architecture</g>
    -   The editor provides a few core operations
    -   Loads tiny libraries that connect keys to those operations
-   Refactor the editor
    -   `onKey` looks up the action associated with a key and runs it
    -   Gives that action the key and the editor itself to work with
    -   Constructor adds two bindings to the lookup table

<%- include('/inc/erase.html', {file: 'bindings-editor.js', tag: 'bindings'}) %>

-   Each binding is derived from a very simple base class

<%- include('/inc/file.html', {file: 'key-binding.js'}) %>

-   Define a class and create a single instance for handling the `enter` key
    -   Tell the editor what key this handles
    -   Act on the editor

<%- include('/inc/slice.html', {file: 'bindings-editor.js', tag: 'enter-binding'}) %>

-   JavaScript allows us to define a class without a name and create an instance
    -   A way to implement the <g key="singleton_pattern">Singleton</g> pattern
    -   

<%- include('/inc/slice.html', {file: 'bindings-editor.js', tag: 'exit-binding'}) %>
