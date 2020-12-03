The C programming language stored character strings as non-zero bytes terminated by a byte containing zero.

::: fixme
Diagram of C string storage.
:::

1.  Write a program that starts with the base address of a string in R1
    and finishes with the length of the string (not including the terminator) in the same register.

2.  Write a program that starts with the base address of a string in R1
    and the base address of some other block of memory in R2
    and copies the string to that new location (inclding the terminator).

3.  What happens in each case if the terminator is missing?
