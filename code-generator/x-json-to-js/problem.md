Write a tool that uses [Escodegen][escodegen]
to translate simple expressions written in JSON into runnable JavaScript.
For example, the tool should translate:

```js
['+', 3, ['*', 5, 'a']]
```

::: unindented
into:
:::

```js
3 + (5 * a)
```
