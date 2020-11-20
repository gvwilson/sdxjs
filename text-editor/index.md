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

<%- include('/_inc/erase.html', {file: 'minimal-editor.js', tag: 'body'}) %>

-   Constructor

<%- include('/_inc/slice.html', {file: 'minimal-editor.js', tag: 'constructor'}) %>

- And when we have to resize

<%- include('/_inc/slice.html', {file: 'minimal-editor.js', tag: 'resize'}) %>

- Drawing the title and status bar

<%- include('/_inc/slice.html', {file: 'minimal-editor.js', tag: 'drawbar'}) %>

- Drawing in general

<%- include('/_inc/slice.html', {file: 'minimal-editor.js', tag: 'draw'}) %>

- Handling keys

<%- include('/_inc/slice.html', {file: 'minimal-editor.js', tag: 'onkey'}) %>

- Handling newlines is special

<%- include('/_inc/slice.html', {file: 'minimal-editor.js', tag: 'newline'}) %>

-   And when the time comes to exit

<%- include('/_inc/slice.html', {file: 'minimal-editor.js', tag: 'exit'}) %>

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

<%- include('/_inc/erase.html', {file: 'bindings-editor.js', tag: 'bindings'}) %>

-   Each binding is derived from a very simple base class

<%- include('/_inc/file.html', {file: 'simple-key-binding.js'}) %>

-   Define a class and create a single instance for handling the `enter` key
    -   Tell the editor what key this handles
    -   Act on the editor

<%- include('/_inc/slice.html', {file: 'bindings-editor.js', tag: 'enter-binding'}) %>

-   JavaScript allows us to define a class without a name and create an instance
    -   A way to implement the <g key="singleton_pattern">Singleton</g> pattern
    -   

<%- include('/_inc/slice.html', {file: 'bindings-editor.js', tag: 'exit-binding'}) %>

-   But if we have to edit the source file to change the bindings, that's hardly extensible
-   Use a configuration file to specify what bindings to load
    -   For simplicity's sake, assume they're all in the same directory
    -   Can easily extend to load a system-wide default configuration from some other directory first and then overlay
-   Modified editor is looking pretty small

<%- include('/_inc/file.html', {file: 'config-editor.js'}) %>

-   Configuration file is just a list of things to `require`

<%- include('/_inc/file.html', {file: 'simple-config.yml'}) %>

-   And each binding is an immediately-instantiated class with the object assigned directly to `module.exports`

<%- include('/_inc/file.html', {file: 'simple-enter.js'}) %>

## What goes in the application and what goes in plugins?

-   At one extreme, the application has a rich interface with lots of operations
    -   Plugins are almost empty (i.e., not much use)
-   At the other extreme, the application is a container for shared state
    -   Plugins manipulate that state directly
    -   Usually a bad idea, but classes can have friends
-   Since we are refactoring an existing implementation:
    -   Anything that is needed by two or more plugins becomes a method
    -   Otherwise, manipulate state directly
-   Add plugins for up/down/left/right and update configuration file
    -   All similar in principle to this one

<%- include('/_inc/file.html', {file: 'simple-left.js'}) %>

-   But what if a plugin needs some extra state?
    -   Or if multiple plugins need to share some extra state?
-   Could have a multi-plugin that registers handlers for several keys
    -   But that just delays the problem
-   Instead, a plugin can add some state to the editor
    -   Add an `init` method to `KeyBinding` that does nothing by default but can be overridden
    -   Adds a new member variable by name if the name is not already in use
    -   So it doesn't matter what order plugins load in
    -   But there *is* the possibility of name collision between two or more plugins
-   While we're there, add an `isDefault` property
    -   Might as well make handling generic characters a binding as well
    -   Complain if someone has already registered as the default handler

<%- include('/_inc/file.html', {file: 'init-key-binding.js'}) %>

-   Modify all existing key bindings to derive from this class
    -   But do not override `init`, since they don't need to
-   And create a handler for all "other" keys
    -   Which is why we've been passing `key` around all this time
-   First, derive a new editor class from the one that handles configuration files

<%- include('/_inc/file.html', {file: 'init-editor.js'}) %>

-   And write the plugin that handles generic characters
    -   Identifies itself as the default handler
    -   A little dangerous to specify `null` as the character it handles
    -   But that's probably better than saying, "If the character is `null`, this must be the default"

<%- include('/_inc/file.html', {file: 'init-character.js'}) %>

-   We can finally add some state: a "dirty" flag to show if there are unsaved changes
    -   Will add extensions in the next section to make use of this

<%- include('/_inc/file.html', {file: 'dirty-character.js'}) %>

-   And since we're allowing plugins to add state, we should provide a method for that

<%- include('/_inc/file.html', {file: 'dirty-editor.js'}) %>

-   Avoids the problem of <g key="circular_dependency">circular dependency</g> discussed in <xref key="module-bundler"></xref>
    by having plugins manipulate the editor without loading it
    -   Works because JavaScript looks methods up dynamically
    -   In a stricter language, we would define an <g key="abstract_base_class">abstract base class</g> for the editor
        that both the actual editor and the plugins could depend on

## How can we replay operations?

-   Many editors allow us to record keystrokes and play them back
    -   And to save recorded operations for re-use, but we won't go that far
-   Can't quite be done with a plugin
    -   Have to intercept keystrokes and recorded them for all handlers
-   Add two pieces of state to the editor
    -   `isRecording` tells the editor whether or not to save keystrokes
    -   `recordedOperations` is the most recently saved operations
-   Modified editor
    -   Parent class does the work of handling the keystroke

<%- include('/_inc/file.html', {file: 'replay-editor.js'}) %>

-   Turning recording on and off
    -   A toggle: <key>Ctrl-R</key> will turn recording on if it's off and off if it's on
    -   When we turn it on, we need to clear any accumulated history (restarting)

<%- include('/_inc/file.html', {file: 'replay-record.js'}) %>

-   Playback is a little more complicated
-   If we are recording then stop
    -   And remove the last entry added to the replay list, because it will be this command
-   Then re-send every saved keystroke in order

<%- include('/_inc/file.html', {file: 'replay-playback.js'}) %>

## How can we undo operations?

-   Add plugin to backspace
    -   <key>Ctrl-H</key> on some keyboards

<%- include('/_inc/file.html', {file: 'dirty-backspace.js'}) %>

-   As soon as we can delete things, we are going to want to undelete them
    -   But we want to undelete in the right place if we have moved elsewhere
-   We need to keep a list of recent operations
    -   <key>Ctrl-U</key> pops the most recent operation and undoes it
    -   Have to undo every operation in order to make sure we get back to the right place
-   But where do operations actually live?
    -   Copying code from "move left" into the `backward` method of "move right" is a bad idea (duplication)
    -   Have each operation `require` its opposite and call its opposite's `forward` method is bad too (circular dependencies)
    -   Move basic operations back into editor
    -   This kind of refactoring is common in the early stages of a design
-   How to undo a delete?
    -   The handler for character deletion must return the character deleted
    -   We need to save that
    -   If an operation (like "undo") returns `null`, don't save it on the undo stack

<%- include('/_inc/erase.html', {file: 'undo-editor.js', tag: 'operations'}) %>
