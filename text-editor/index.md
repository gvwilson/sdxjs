---
---

A terminal editor based on [Termit][termit] using [terminal-kit][terminal-kit].

## What does an editor need to be able to do? {#capability}

-   Overall structure

{% include interpolate.md file="editor.js" %}

## How can we set up? {#setup}

-   Constructor

{% include file.md file="constructor.js" %}

-   Initialize

{% include file.md file="init.js" %}

-   Titles

{% include file.md file="titles.js" %}

## How should the editor handle files? {#file-handling}

-   File handling

{% include file.md file="file.js" %}

-   Loading and saving

{% include file.md file="loadsave.js" %}

-   Get a filename from the user

{% include file.md file="getfilename.js" %}

## How should the editor handle interactions? {#interactions}

-   Handle resizing

{% include file.md file="resize.js" %}

-   Handling keystrokes

{% include file.md file="keystroke.js" %}

-   Drawing

{% include file.md file="drawing.js" %}

-   Cursor movement

{% include file.md file="movement.js" %}

-   Larger movement

## How should the editor handle keystrokes? {#keystrokes}

{% include file.md file="jump.js" %}

-   Special characters

{% include file.md file="specialchar.js" %}

-   Cut and paste

{% include file.md file="cutpaste.js" %}

{% include links.md %}
