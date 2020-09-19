---
---

A terminal editor based on [Termit][termit] using [terminal-kit][terminal-kit].

## What does an editor need to be able to do?

-   Overall structure

<%- include('/inc/code.html', {file: 'editor.js'}) %>

## How can we set up?

-   Constructor

<%- include('/inc/code.html', {file: 'constructor.js'}) %>

-   Initialize

<%- include('/inc/code.html', {file: 'init.js'}) %>

-   Titles

<%- include('/inc/code.html', {file: 'titles.js'}) %>

## How should the editor handle files?

-   File handling

<%- include('/inc/code.html', {file: 'file.js'}) %>

-   Loading and saving

<%- include('/inc/code.html', {file: 'loadsave.js'}) %>

-   Get a filename from the user

<%- include('/inc/code.html', {file: 'getfilename.js'}) %>

## How should the editor handle interactions?

-   Handle resizing

<%- include('/inc/code.html', {file: 'resize.js'}) %>

-   Handling keystrokes

<%- include('/inc/code.html', {file: 'keystroke.js'}) %>

-   Drawing

<%- include('/inc/code.html', {file: 'drawing.js'}) %>

-   Cursor movement

<%- include('/inc/code.html', {file: 'movement.js'}) %>

-   Larger movement

## How should the editor handle keystrokes?

<%- include('/inc/code.html', {file: 'jump.js'}) %>

-   Special characters

<%- include('/inc/code.html', {file: 'specialchar.js'}) %>

-   Cut and paste

<%- include('/inc/code.html', {file: 'cutpaste.js'}) %>
