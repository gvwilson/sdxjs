{% if include.problem %}

1.  Modify the tokenizer to recognize named groups.
    For example, the named group `/(?<triple>aaa)/`
    would create a named group called `triple` that matches exactly three consecutive occurrences of 'a'.

2.  Write Mocha tests for your modified tokenizer.
    Does it handle nested named groups?

{% else %}

FIXME: write solution.

{% endif %}
