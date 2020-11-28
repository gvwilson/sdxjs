The regular expressions we have seen so far are <g key="eager_matching">eager</g>:
they match as much as they can, as early as they can.
An alternative is <g key="lazy_matching">lazy matching</g>,
in which expressions match as little as they need to.
For example,
given the string `"ab"`,
an eager match with the expression `/ab*/` will match both letters
(because `/b*/` matches a 'b' if one is available)
but a lazy match will only match the first letter
(because `/b*/` can match no letters at all).
Implement lazy matching for the `*` operator.
