{% if include.problem %}

Write a function that creates fixtures for testing the constraint solver:

1.  Its first argument is an object whose keys are (fake) package names
    and whose values are integers indicating the number of versions of that package
    to include in the test set,
    such as `{'left': 3, 'middle': 2, 'right': 15}`.
    Its second argument is a <span g="seed">seed</span> for random number generation.

2.  It generates one valid configuration,
    such as `{'left': 2, 'middle': 2, 'right': 9}`.
    (This is to ensure that there is at least one installable set of packages.)

3.  It then generates random constraints between the packages.
    (These may or may not result in other installable combinations.)
    When this is done,
    it adds constraints so that the valid configuration from the previous step is included.

{% else %}

FIXME: write solution.

{% endif %}
