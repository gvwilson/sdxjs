Modify `hope.js` so that users can optionally provide an array of strings to tag tests:

```js
hope.test('Difference of 1 and 2',
          () => assert((1 - 2) === -1),
          ['math', 'fast'])
```

Then modify `pray.js` so that if users specify either `-t tagName` or `--tag tagName`
only tests with that tag are run.
