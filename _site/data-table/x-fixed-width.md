{% if include.problem %}

To improve performance,
databases often store <span g="fixed_width_string">fixed-width</span> strings,
i.e.,
they limit the length of the strings in a column to some fixed size
and <span g="pad_string">pad</span> strings that are shorter than that.

1.  Write a function that takes an array of strings and an integer with
    and creates an `ArrayBuffer` containing the strings padded to that width.
    The function should throw an exception if any of the strings
    are longer than the specified width.

2.  Write another function that takes an `ArrayBuffer` as input
    and returns an array of strings.
    This function should remove the padding
    so that strings shorter than the fixed width are restored to their original form.

{% else %}

FIXME: write solution.

{% endif %}
