---
---

-   Computers don't execute JavaScript directly
    -   Each processor has its own <g key="instruction_set">instruction set</g>
    -   A <g key="compiler">compiler</g> translates high-level language into those instructions
-   Often use an intermediate representation called <g key="assembly_code">assembly code</g>
    -   Human-readable names instead of numbers
-   We will simulate a very simple processor with a little bit of memory
    -   Also check out the game [Human Resource Machine][human-resource-machine]

## What is the architecture of our virtual machine?

-   An <g key="instruction_pointer">instruction pointer</g> that holds the memory address of the next instruction to execute
    -   Always starts at address 0
    -   Part of the <g key="abi">Application Binary Interface</g> (ABI) for our virtual machine
-   Four <g key="register">registers</g>
    -   No memory-to-memory operations
    -   Everything happens in or through registers
-   256 <g key="word_memory">words</g> of memory
    -   Stores both the program and the data
    -   Each address will fit in a single byte
-   Instructions are 3 bytes long
    -   <g key="op_code">Op code</g> fits into one byte
    -   Zero, one, or two operands, each a byte long
    -   Each operand is a register or a value (constant or address)
    -   So the largest constant we can represent directly is 256
-   Use `r` and `v` to indicate format

<%- include('/inc/figure.html', {
    id: 'virtual-machine-architecture',
    img: '/static/tools-small.jpg',
    alt: 'Virtual machine architecture',
    cap: 'Architecture of the virtual machine.',
    fixme: true
}) %>

<%- include('/inc/table.html', {
    id: 'virtual-machine-op-codes',
    file: 'op-codes.tbl',
    cap: 'Virtual machine op codes.'
}) %>

-   Put architectural details into a file shared by other components

<%- include('/inc/file.html', {file: 'architecture.js'}) %>

## How can we execute these instructions?

-   As before, split a class that would normally be written in one piece into several pieces for exposition
-   Start by defining a class with an instruction pointer, some registers, and some memory
    -   Also have a prompt for output

<%- include('/inc/erase.html', {file: 'vm-base.js', key: 'skip'}) %>

-   A program is an array of numbers
    -   Copy into RAM and reset the instruction pointer and registers

<%- include('/inc/keep.html', {file: 'vm-base.js', key: 'initialize'}) %>

-   To get the next instruction:
    -   Get the value in memory that the instruction pointer currently refers to
    -   Move the instruction pointer on by one address
    -   Use bitwise operations to extract op code and operands from the instruction
    -   Some instructions don't have two operands, but a hardware implementation would unpack the same number every time

<%- include('/inc/figure.html', {
    id: 'virtual-machine-unpacking',
    img: '/static/tools-small.jpg',
    alt: 'Unpacking instructions',
    cap: 'Using bitwise operations to unpack instructions.',
    fixme: true
}) %>

<%- include('/inc/keep.html', {file: 'vm-base.js', key: 'fetch'}) %>

-   We have included assertions
    -   Hardware detects illegal instructions and out-of-bounds memory addresses
-   Now we implement the run cycle
    -   Fetch instruction and take action until told to stop

<%- include('/inc/erase.html', {file: 'vm.js', key: 'skip'}) %>

-   Some typical instructions
-   Store the value of one register in the address held by another register

<%- include('/inc/keep.html', {file: 'vm.js', key: 'op_str'}) %>

-   Add the value in one register to the value in another register

<%- include('/inc/keep.html', {file: 'vm.js', key: 'op_add'}) %>

-   Jump to a fixed address if the value in a register is zero

<%- include('/inc/keep.html', {file: 'vm.js', key: 'op_beq'}) %>

## What do assembly programs look like?

-   We could create numbers ourselves
-   Much easier to use an <g key="assembler">assembler</g> to turn a very simple language into those numbers
    -   A compiler for a particular kind of machine-oriented language
-   Here's a program to print the value stored in R1 and then halt

<%- include('/inc/file.html', {file: 'print-r1.as'}) %>

-   This is its numeric representation

<%- include('/inc/file.html', {file: 'print-r1.mx'}) %>

-   This program prints the numbers from 0 to 2

<%- include('/inc/multi.html', {pat: 'count-up.*', fill: 'as mx'}) %>

<%- include('/inc/figure.html', {
    id: 'virtual-machine-count-up',
    img: '/static/tools-small.jpg',
    alt: 'Counting from 0 to 2',
    cap: 'Flowchart of assembly language program to count up from 0 to 2.',
    fixme: true
}) %>

-   The <g key="label_address">label</g> `loop` doesn't take up any space
    -   Tells the assembler to give the address of the next instruction a name
    -   We can then refer to that address as `@loop`
-   Trace its execution
    -   R0 holds the current loop index
    -   R1 holds the loop's upper bound (in this case 3)
    -   Loop prints the value of R0 (one instruction)
    -   Adds 1 to R0 (two instructions because we can only add register-to-register)
    -   Checks to see if we should loop again (three instructions)
    -   If we *don't* jump back, halt

<%- include('/inc/figure.html', {
    id: 'virtual-machine-trace-counter',
    img: '/static/tools-small.jpg',
    alt: 'Trace counting program',
    cap: 'Tracing registers and memory values for a simple counting program.',
    fixme: true
}) %>

-   Steps in assembly are pretty simple
    -   Get interesting lines
    -   Find the addresses of labels
    -   Turn each remaining line into an instruction

<%- include('/inc/keep.html', {file: 'assembler.js', key: 'assemble'}) %>

-   To find labels, go through lines one by one
    -   Either save the label *or* increment the current address, because labels don't take up space

<%- include('/inc/keep.html', {file: 'assembler.js', key: 'find-labels'}) %>

-   To compile a single instruction
    -   Break the line into <g key="token">tokens</g>
    -   Look up the format for the operands
    -   Pack them into a single value

<%- include('/inc/keep.html', {file: 'assembler.js', key: 'compile'}) %>

-   Combining op codes and operands into a single value is the reverse of the unpacking done by the virtual machine

<%- include('/inc/keep.html', {file: 'assembler.js', key: 'combine'}) %>

-   A few utility functions

<%- include('/inc/keep.html', {file: 'assembler.js', key: 'utilities'}) %>

-   Let's try running a few programs and display:
    -   Their output
    -   The registers
    -   The interesting contents of memory
-   Counting up to three

<%- include('/inc/file.html', {file: 'count-up.as'}) %>
<%- include('/inc/file.html', {file: 'count-up-out.out'}) %>

## How can we store data?

-   Allocate storage after the program for arrays
-   Use `.data` on a line of its own to mark the start of the data section
-   Then `label: number` to give a region a name and allocate some storage space

<%- include('/inc/figure.html', {
    id: 'virtual-machine-storage-allocation',
    img: '/static/tools-small.jpg',
    alt: 'Storage allocation',
    cap: 'Allocating storage for arrays in the virtual machine.',
    fixme: true
}) %>

-   A few changes to the assembler
-   Split the lines into instructions and data allocations

<%- include('/inc/keep.html', {file: 'allocate-data.js', key: 'assemble'}) %>

<%- include('/inc/keep.html', {file: 'allocate-data.js', key: 'split-allocations'}) %>

-   Figure out where each allocation will lie and create a label accordingly

<%- include('/inc/keep.html', {file: 'allocate-data.js', key: 'add-allocations'}) %>

-   And that's it: no changes needed to compilation or execution
-   Fill an array with the numbers from 0 to 3

<%- include('/inc/file.html', {file: 'fill-array.as'}) %>
<%- include('/inc/file.html', {file: 'fill-array-out.out'}) %>
