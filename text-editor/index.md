---
---

-   We have been writing a lot of files---how does the editor itself work?
-   Explore by <g key="refactoring">refactoring</g> a terminal editor that's even simpler than [Nano][nano]
    based on [Morten Olsrud][olsrud-morten]'s [Termit][termit]
    -   Uses the [terminal-kit][terminal-kit] package to manage screen interactions
-   We will not dive into technical details, since this isn't a lesson on terminal management
-   But will see:
    -   How to build a <g key="plugin_architecture">plugin architecture</g>
    -   How to implement record-and-playback
    -   How to implement undo/redo

## What is our starting point?

-   As in <xref key="build-manager"></xref> and elsewhere, write a <g key="driver">driver</g> to load and run our experiments

<%- include('/inc/file.html', {file: 'edit.js'}) %>

-   Original editor is <%- include('/inc/linecount.html', {file: 'original.js'}) %> lines long
    -   Don't need to understand all of the screen operations in order to start changing it
    -   But do need an overview of core concepts
-   A <g key="screen_buffer">screen buffer</g> holds contents of a rectangular area of the screen
    -   Each cell contains a character, foreground and background colors, etc.
    -   Buffer as a whole writes directly to the terminal, or to another screen buffer
-   A <g key="text_buffer">text buffer</g> is always backed by a screen buffer
    -   Holds lines of text (an array of strings)
    -   Provides methods for user-level text interaction

<%- include('/inc/fig.html', {
    id: 'text-editor-buffers',
    img: '/static/tools-small.jpg',
    alt: 'Screen and text buffers',
    cap: 'Using screen buffers and text buffers to display text.',
    fixme: true
}) %>

-   Start with a basic editor that draws on the screen and exits immediately when any key is pressed
    -   Just <%- include('/inc/linecount.html', {file: 'base-editor.js'}) %> lines long

<%- include('/inc/erase.html', {file: 'base-editor.js', key: 'skip'}) %>

-   Constructor creates `this.term`, which connects the editor to the text terminal
-   Sets a few constants
    -   Mostly self-explanatory
    -   `this.statusBarTime` used to control how long the status bar is displayed
-   Creates the screen buffer and text buffer
    -   Screen buffer is the height of the terminal minus two lines (for title bar at the top and status bar at the bottom)
-   Set the text being edited to an empty string
-   Provide an `onKey` method to handle keystrokes
    -   For now, exit on any key

<%- include('/inc/keep.html', {file: 'base-editor.js', key: 'onKey'}) %>

-   Now add the basic operations
    -   For example, saving files

<%- include('/inc/keep.html', {file: 'core-operations.js', key: 'save'}) %>

-   Other commands to move cursor, cut and paste lines, etc.
-   But `onKey` is one big switch statement

<%- include('/inc/keeperase.html', {file: 'core-operations.js', keep: 'onKey', erase: 'skip'}) %>

-   Adding methods isn't enough to give the editor new functionality
    -   Must also insert text into the switch statement
    -   Which will be fragile
-   And there's no obvious way to record features for playback or for undo/redo

## How can we make the editor extensible?

-   Lookup tables should be tables, not if/else or switch statements
-   Modify the editor to:
    -   Create a table of <g key="key_binding">key bindings</g>
    -   Look keys up in that table to find out what to do

<%- include('/inc/fig.html', {
    id: 'text-editor-lookup-table',
    img: '/static/tools-small.jpg',
    alt: 'Looking up key bindings',
    cap: 'Using a lookup table to manage key bindings.',
    fixme: true
}) %>

<%- include('/inc/erase.html', {file: 'lookup-editor.js', key: 'bindings'}) %>

-   Creating bindings is just building a table of functions

<%- include('/inc/keep.html', {file: 'lookup-editor.js', key: 'bindings'}) %>

-   To add a new operation
    -   Implement the method
    -   Add an entry to the key bindings table in the constructor of the derived class
-   But we can now also provide plugins
-   Load functions that take the editor and the arguments to `onKey` as input

<%- include('/inc/fig.html', {
    id: 'text-editor-plugins',
    img: '/static/tools-small.jpg',
    alt: 'Loading and running plugins',
    cap: 'Loading and running plugins to handle keystrokes.',
    fixme: true
}) %>

-   Have to modify the default handlers to take these four arguments as well, just in case

<%- include('/inc/erase.html', {file: 'plugin-editor.js', key: 'skip'}) %>

-   Notice the two-step `import` because `Promise.all` needs promises
    -   Will write an `async` function that combines the steps in the exercises

## How can we record and play back?

-   Many editors allow us to record keystrokes and play them back
    -   And to save recorded operations for re-use, but we won't go that far
-   Can't quite be done with a plugin
    -   Have to intercept keystrokes and recorded them for all handlers
-   Add two pieces of state to the editor
    -   `isRecording` tells the editor whether or not to save keystrokes
    -   `recordedOperations` is the most recently saved operations

<%- include('/inc/fig.html', {
    id: 'text-editor-playback',
    img: '/static/tools-small.jpg',
    alt: 'Implementing record and playback',
    cap: 'Storing recent state to implement record and playback.',
    fixme: true
}) %>

-   Modified editor
    -   Parent class does the work of handling the keystroke
-   Turning recording on and off
    -   A toggle: <key>Ctrl-R</key> will turn recording on if it's off and off if it's on
    -   When we turn it on, we need to clear any accumulated history (restarting)
-   Modify constructor to create the state we need and record the two new key bindings

<%- include('/inc/keep.html', {file: 'replay-editor.js', key: 'constructor'}) %>

-   `onKey` records everything and then does whatever the keystroke would normally do

<%- include('/inc/keep.html', {file: 'replay-editor.js', key: 'onKey'}) %>

-   `record` toggles the `isRecording` flag and re-starts recording if needed
    -   Note the `pop` so that the command that brought us here isn't recorded
    -   Yes, this led to infinite recursion

<%- include('/inc/keep.html', {file: 'replay-editor.js', key: 'record'}) %>

-   `playback` also turns off recording
    -   Again, want to avoid infinite loop
-   If any commands have been recorded, re-issue them

<%- include('/inc/keep.html', {file: 'replay-editor.js', key: 'playback'}) %>

-   Can be done with plugins
    -   The extra state needed in the editor makes a plugin more complicated
    -   Can have both plugins check for the state they need and add member variables if not present
-   Or write plugins as classes with `onLoad` and `onKey` methods

## How can we undo operations?

-   The opposite of "move left" is "move right", so no extra information required
-   But the opposite of "cut line" is "paste line"
    -   Need to record state for some operations but not for others
    -   Use a stack because we undo in reverse order to doing

<%- include('/inc/fig.html', {
    id: 'text-editor-undo-stack',
    img: '/static/tools-small.jpg',
    alt: 'Managing undo with a stack',
    cap: 'Using a stack to store undoable operations.',
    fixme: true
}) %>

-   Solution is one we hinted at earlier: implement each operation as a class
    -   `run` and `undo` methods (because `do` is a keyword in JavaScript)
-   But not all operations are undoable
    -   `op.save` tells us whether the operation should be saved
    -   `op.clear` tells us whether the undo stack should be cleared
-   Go all the way back to the original editor and modify the constructor

<%- include('/inc/keep.html', {file: 'undo-editor.js', key: 'constructor'}) %>

-   Handling a key now takes undo into account
    -   Look up a class in the bindings table, make an instance, and run it
    -   Look in that instance to see whether to save, clear, or neither

<%- include('/inc/keep.html', {file: 'undo-editor.js', key: 'onKey'}) %>

-   Base class for operations
    -   Record all the information about the keystroke
    -   Set defaults for saving and clearing
    -   Fail if the `run` or `undo` methods are called (must be overridden)

<%- include('/inc/keep.html', {file: 'undo-editor.js', key: 'KeyBase'}) %>

-   Handle a printable character
    -   Insert it going forward
    -   Backspace to undo
    -   Assumes we are back in the same place

<%- include('/inc/keep.html', {file: 'undo-editor.js', key: 'KeyCharacter'}) %>

-   Exiting is easier
    -   Indicate that the operation isn't undoable

<%- include('/inc/keep.html', {file: 'undo-editor.js', key: 'KeyExit'}) %>

-   Full of bugs
-   Going up and then down doesn't restore location if we were at the end of a long line and went up to a short one
    -   So the operation should save the XY location to return to and move the cursor there
-   Cutting a line isn't currently undoable
    -   Should save location and text for restoring
-   Requires a deeper dive into the text buffer
