{% if include.problem %}

Write a tool that uses [Escodegen][escodegen]
to translate simple expressions written in JSON into runnable JavaScript.
For example, the tool should translate:

```js
['+', 3, ['*', 5, 'a']]
```

{: .continue}
into:

```js
3 + (5 * a)
```

{% else %}

FIXME: write solution.

{% endif %}
