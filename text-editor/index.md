---
---

A terminal editor based on [Termit][termit] using [terminal-kit][terminal-kit].

## What does an editor need to be able to do?

-   Overall structure

<%- include('/_inc/code.html', {file: 'editor.js'}) %>

## How can we set up?

-   Constructor

<%- include('/_inc/code.html', {file: 'constructor.js'}) %>

-   Initialize

<%- include('/_inc/code.html', {file: 'init.js'}) %>

-   Titles

<%- include('/_inc/code.html', {file: 'titles.js'}) %>

## How should the editor handle files?

-   File handling

<%- include('/_inc/code.html', {file: 'file.js'}) %>

-   Loading and saving

<%- include('/_inc/code.html', {file: 'loadsave.js'}) %>

-   Get a filename from the user

<%- include('/_inc/code.html', {file: 'getfilename.js'}) %>

## How should the editor handle interactions?

-   Handle resizing

<%- include('/_inc/code.html', {file: 'resize.js'}) %>

-   Handling keystrokes

<%- include('/_inc/code.html', {file: 'keystroke.js'}) %>

-   Drawing

<%- include('/_inc/code.html', {file: 'drawing.js'}) %>

-   Cursor movement

<%- include('/_inc/code.html', {file: 'movement.js'}) %>

-   Larger movement

## How should the editor handle keystrokes?

<%- include('/_inc/code.html', {file: 'jump.js'}) %>

-   Special characters

<%- include('/_inc/code.html', {file: 'specialchar.js'}) %>

-   Cut and paste

<%- include('/_inc/code.html', {file: 'cutpaste.js'}) %>
