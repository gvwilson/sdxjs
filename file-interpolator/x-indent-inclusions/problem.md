Modify the file inclusion system
so that inclusions are indented by the same amount as the including comment.
For example,
if the including file is:

```js
const withLogging = (args) => {
  /*+ logging call + logging.js +*/
}

withLogging
```

::: unindented
and the included file is:
:::

```js
console.log('first message')
console.log('second message')
```

::: unindented
then the result will be:
:::

```js
const withLogging = (args) => {
  console.log('first message')
  console.log('second message')
}

withLogging
```

:::
i.e., all lines of the inclusion will be indented to match the first.
:::
