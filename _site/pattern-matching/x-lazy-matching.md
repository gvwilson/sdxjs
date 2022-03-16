{% if include.problem %}

The regular expressions we have seen so far are <span g="eager_matching">eager</span>:
they match as much as they can, as early as they can.
An alternative is <span g="lazy_matching">lazy matching</span>,
in which expressions match as little as they need to.
For example,
given the string `"ab"`,
an eager match with the expression `/ab*/` will match both letters
(because `/b*/` matches a 'b' if one is available)
but a lazy match will only match the first letter
(because `/b*/` can match no letters at all).
Implement lazy matching for the `*` operator.

{% else %}

FIXME: write solution

{% endif %}
