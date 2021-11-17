{% if include.problem %}

Suppose we create a promise that deliberately fails
and attach both `then` and `catch` to it:

{% include file file='x-catch-then/example.js' %}

{: .continue}
When the code is run it produces:

{% include file file='x-catch-then/example.txt' %}

1.  Trace the order of execution.
2.  Why is `undefined` printed at the end?

{% else %}

FIXME: write solution

{% endif %}
