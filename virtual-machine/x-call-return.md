{% if include.problem %}

1.  Add another register to the virtual machine called SP (for "stack pointer")
    that is automatically initialized to the *last* address in memory.

2.  Add an instruction `psh` (short for "push") that copies a value from a register
    to the address stored in SP and then subtracts one from SP.

3.  Add an instruction `pop` (short for "pop") that adds one to SP
    and then copies a value from that address into a register.

4.  Using these instructions,
    write a subroutine that evaluates `2x+1` for every value in an array.

{% else %}

FIXME: write solution.

{% endif %}
