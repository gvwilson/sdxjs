Instead of having plugins tell the editor to save them on the undo stack or clear the stack entirely,
modify both `UndoEditor` and the plugins so that commands save themselves or clear the stack directly.
