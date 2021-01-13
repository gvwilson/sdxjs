---
---

Computers don't execute JavaScript directly.
Each processor has its own <g key="instruction_set">instruction set</g>,
and it's the job of a <g key="compiler">compiler</g> to translate high-level language into those instructions.
Compilers often use an intermediate representation called <g key="assembly_code">assembly code</g>
that gives instructions human-readable names instead of numbers.
To understand more about how JavaScript actually runs
we will simulate a very simple processor with a little bit of memory.
You may also want to check out the game [Human Resource Machine][human-resource-machine],
which asks you to solve puzzles of increasing difficulty using an even simpler processor.

## What is the architecture of our virtual machine?

Our <g key="virtual_machine">virtual machine</g> has three parts,
which are shown in <f key="virtual-machine-architecture"></f>
for a program made up of 110 instructions:

1.  An <g key="instruction_pointer">instruction pointer</g> (IP)
    that holds the memory address of the next instruction to execute.
    It is automatically initialized to point at address 0,
    which is where every program must start.
    This rule is part of the <g key="abi">Application Binary Interface</g> (ABI) for our virtual machine.

1.  Four <g key="register">registers</g> named R0 to R4 that instructions can access directly.
    There are no memory-to-memory operations in our VM:
    everything  happens in or through registers.

1.  256 <g key="word_memory">words</g> of memory, each of which can store a single value.
    Both the program and its data live in this single block of memory;
    we chose the size 256 so that each address will fit in a single byte.

<%- include('/inc/figure.html', {
    id: 'virtual-machine-architecture',
    img: './figures/architecture.svg',
    alt: 'Virtual machine architecture',
    cap: 'Architecture of the virtual machine.'
}) %>

The instructions for our VM are 3 bytes long.
The <g key="op_code">op code</g> fits into one byte,
and each instruction may optionally include one or two operands,
each a byte long.
Each operand is a register identifier,
a constant
or an address
(which is just a constant that identifies a location in memory).
This means that the largest constant we can represent directly is 256.
<t key="virtual-machine-op-codes"></t> uses the letters `r`, `c`, and `a`
to indicate instruction format,
where `r` indicates a register identifier,
`c` indicates a constant,
and `a` indicates an address.

<%- include('/inc/table.html', {
    id: 'virtual-machine-op-codes',
    file: 'op-codes.tbl',
    cap: 'Virtual machine op codes.'
}) %>

We put our VM's architectural details in a file
that can be shared by other components:

<%- include('/inc/file.html', {file: 'architecture.js'}) %>

## How can we execute these instructions?

As in previous chapters,
we will split a class that would normally be written in one piece into several pieces for exposition.
To start,
we define a class with an instruction pointer, some registers, and some memory,
along with a prompt for output:

<%- include('/inc/erase.html', {file: 'vm-base.js', key: 'skip'}) %>

A program is just an array of numbers.
To load one,
we copy those numbers into RAM and reset the instruction pointer and registers:

<%- include('/inc/keep.html', {file: 'vm-base.js', key: 'initialize'}) %>

To handle the next instruction,
the VM gets the value in memory that the instruction pointer currently refers to
and moves the instruction pointer on by one address.
It then uses <g key="bitwise_operation">bitwise operations</a>
to extract the op code and operands from the instruction
(<f key="virtual-machine-unpacking"></f>).

<%- include('/inc/keep.html', {file: 'vm-base.js', key: 'fetch'}) %>

<%- include('/inc/figure.html', {
    id: 'virtual-machine-unpacking',
    img: './figures/unpacking.svg',
    alt: 'Unpacking instructions',
    cap: 'Using bitwise operations to unpack instructions.'
}) %>

::: callout
### Semi-realistic

We always unpack two operands regardless of whether the instructions has them or not,
since this is what a hardware implementation would be.
We have also included assertions in our VM
to simulate the way that real hardware includes logic
to detect illegal instructions and out-of-bound memory addresses.
:::

The next step is to extend our base class with one that has a `run` method.
As its name suggests,
this runs the program by fetching instructions and taking action until told to stop:

<%- include('/inc/erase.html', {file: 'vm.js', key: 'skip'}) %>

Some instructions are very similar to others,
so we will only look at three here.
The first stores the value of one register in the address held by another register:

<%- include('/inc/keep.html', {file: 'vm.js', key: 'op_str'}) %>

::: continue
The first three lines check that the operation is legal;
the fourth one uses the value in one register as an address,
which is why it has nested array indexing.
:::

Adding the value in one register to the value in another register
is ever simpler:

<%- include('/inc/keep.html', {file: 'vm.js', key: 'op_add'}) %>

::: continue
as is jumping to a fixed address if the value in a register is zero:
:::

<%- include('/inc/keep.html', {file: 'vm.js', key: 'op_beq'}) %>

## What do assembly programs look like?

We could figure out numerical op codes by hand,
and in fact that's what [the first programmers][eniac-programmers] did.
However,
it is much easier to turn a very simple language into those numbers
using an <g key="assembler">assembler</g>,
which is just a small compiler for a language that very closely represents actual machine instructions.
Here's a program in assembly language to print the value stored in R1 and then halt:

<%- include('/inc/file.html', {file: 'print-r1.as'}) %>

::: continue
and this is its numeric representation:
:::

<%- include('/inc/file.html', {file: 'print-r1.mx'}) %>

This program prints the numbers from 0 to 2
(<f key="virtual-machine-count-up"></f>):

<%- include('/inc/multi.html', {pat: 'count-up.*', fill: 'as mx'}) %>

<%- include('/inc/figure.html', {
    id: 'virtual-machine-count-up',
    img: './figures/count-up.svg',
    alt: 'Counting from 0 to 2',
    cap: 'Flowchart of assembly language program to count up from 0 to 2.'
}) %>

The <g key="label_address">label</g> `loop` doesn't take up any space,
but instead tells the assembler to give the address of the next instruction a name
so that we can refer to that address as `@loop`.

Let's trace this program's execution
(<f key="virtual-machine-trace-counter"></f>):

1.  R0 holds the current loop index.
1.  R1 holds the loop's upper bound (in this case 3).
1.  The loop prints the value of R0 (one instruction).
1.  The program adds 1 to R0.
    This takes two instructions because we can only add register-to-register.
1.  It checks to see if we should loop again,
    which takes three instructions.
1.  If the program *doesn't* jump back, it halts.

<%- include('/inc/figure.html', {
    id: 'virtual-machine-trace-counter',
    img: './figures/trace-counter.svg',
    alt: 'Trace counting program',
    cap: 'Tracing registers and memory values for a simple counting program.'
}) %>

The implementation of the assembler mirrors the simplicity of assembly language.
The main method gets interesting lines,
finds the addresses of labels,
and turns each remaining line into an instruction:

<%- include('/inc/keep.html', {file: 'assembler.js', key: 'assemble'}) %>

To find labels,
we go through the lines one by one
and either save the label *or* increment the current address
(because labels don't take up space):

<%- include('/inc/keep.html', {file: 'assembler.js', key: 'find-labels'}) %>

To compile a single instruction we break the line into tokens,
look up the format for the operands,
and then pack them into a single value:

<%- include('/inc/keep.html', {file: 'assembler.js', key: 'compile'}) %>

Combining op codes and operands into a single value
is the reverse of the unpacking done by the virtual machine:

<%- include('/inc/keep.html', {file: 'assembler.js', key: 'combine'}) %>

Finally, we need few utility functions:

<%- include('/inc/keep.html', {file: 'assembler.js', key: 'utilities'}) %>

Let's try assembling a program and display its output,
the registers,
and the interesting contents of memory.
This program counts up to three:

<%- include('/inc/file.html', {file: 'count-up.as'}) %>
<%- include('/inc/file.html', {file: 'count-up-out.out'}) %>

## How can we store data?

It's hard to write interesting programs when each value needs a unique name.
We can do a lot more once we have collections like arrays,
so let's add those to our assembler.
(We don't have to make any changes to the virtual machine,
which doesn't care how we think about our data.)
We will allocate storage for arrays after the program
by using `.data` on a line of its own to mark the start of the data section
and then `label: number` to give a region a name and allocate some storage space
(<f key="virtual-machine-storage-allocation"></f>).

<%- include('/inc/figure.html', {
    id: 'virtual-machine-storage-allocation',
    img: './figures/storage-allocation.svg',
    alt: 'Storage allocation',
    cap: 'Allocating storage for arrays in the virtual machine.'
}) %>

This enhancement only requires a few changes to the assembler.
First,
we need to split the lines into instructions and data allocations:

<%- include('/inc/keep.html', {file: 'allocate-data.js', key: 'assemble'}) %>

<%- include('/inc/keep.html', {file: 'allocate-data.js', key: 'split-allocations'}) %>

Second,
we need to figure out where each allocation will lie and create a label accordingly:

<%- include('/inc/keep.html', {file: 'allocate-data.js', key: 'add-allocations'}) %>

And that's it:
no other changes needed to compilation or execution.
To test it,
let's fill an array with the numbers from 0 to 3:

<%- include('/inc/file.html', {file: 'fill-array.as'}) %>
<%- include('/inc/file.html', {file: 'fill-array-out.out'}) %>
