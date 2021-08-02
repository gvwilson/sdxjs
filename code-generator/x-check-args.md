{% if include.problem %}

Write a tool that modifies functions to check the types of their arguments at run-time.

1.  Each function is replaced by a function that passes all of its arguments to `checkArgs`
    along with the function's name,
    then continues with the function's original operation.

2.  The first time `checkArgs` is called for a particular function
    it records the actual types of the arguments.

3.  On subsequent calls, it checks that the argument types match those of the first call
    and throws an exception if they do not.

{% else %}

FIXME: write solution.

{% endif %}
