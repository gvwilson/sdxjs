{% if include.problem %}

Rather than having some objects call `setXYZ` methods in other objects,
it is common practice to use a lookup table for mutual dependencies:

1.  Every object initializes calls `table.set(name, this)` in its constructor.

2.  Whenever object A needs the instance of object B,
    it calls `table.lookup('B')`.
    It does *not* store the result in a member variable.

Modify the virtual machine and debugger to use this pattern.

{% else %}

FIXME: write solution.

{% endif %}
