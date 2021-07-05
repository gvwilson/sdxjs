Write a decorator that takes a function as its argument
and returns a new function that behaves exactly the same way
except that it keeps track of who called it.

1.  The program contains a stack where decorated functions push and pop their names
    as they are called and as they exit.

2.  Each time a function is called
    it adds a record to an array to record its name and the name at the top of the stack
    (i.e., the most-recently-called decorated function).
