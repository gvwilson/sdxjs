{% if include.problem %}

Modify the unit testing framework to handle `async` functions,
so that:

```js
hope.test('delayed test', async () => {...})
```

{: .continue}
does the right thing.
(Note that you can use `typeof` to determine whether the object given to `hope.test`
is a function or a promise.)

{% else %}

FIXME: write solution.

{% endif %}
