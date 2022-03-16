{% if include.problem %}

1.  Modify the existing code so that elements may specify `border: true` or `border: false`
    (with the latter being the default).
    If an element's `border` property is `true`,
    it is drawn with a dashed border.
    For example,
    if the `border` property of `row` is `true`,
    then `<row>text</row>` is rendered as:

    ```txt
    +----+
    |text|
    +----+
    ```

2.  Extend your solution so that if two adjacent cells both have borders,
    only a single border is drawn.
    For example,
    if the `border` property of `col` is `true`,
    then:

    ```html
    <row><col>left</col><col>right</col></row>
    ```

    {: .continue}
    is rendered as:

    ```txt
    +----+-----+
    |left|right|
    +----+-----+
    ```

{% else %}

FIXME: write solution.

{% endif %}
