{% if include.problem %}

Modify the virtual machine so that developers can add "system calls" to it.

1.  On startup,
    the virtual machine loads an array of functions defined in a file called `syscalls.js`.

2.  The `sys` instruction takes a one-byte constant argument.
    It looks up the corresponding function and calls it with the values of R0-R3 as parameters
    and places the result in R0.

{% else %}

FIXME: write solution.

{% endif %}
