{% if include.problem %}

1.  Modify the constraint solver so that
    it uses a list of package exclusions instead of a list of package requirements,
    i.e.,
    its input tells it that version 1.2 of package Red
    can *not* work with versions 3.1 and 3.2 of package Green
    (which implies that Red 1.2 can work with any other versions of Green).

2.  Explain why package managers aren't built this way.

{% else %}

FIXME: write solution.

{% endif %}
