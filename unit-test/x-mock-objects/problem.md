A <g key="mock_object">mock object</g> is a simplified replacement for part of a program
whose behavior is easier to control and predict than the thing it is replacing.
For example,
we may want to test that our program does the right thing if an error occurs while reading a file.
To do this,
we write a function that wraps `fs.readFileSync`:

```js
const mockReadFileSync = (filename, encoding = 'utf-8') => {
  return fs.readFileSync(filename, encoding)
}
```

::: continue
and then modify it so that it throws an exception under our control.
For example,
if we define `MOCK_READ_FILE_CONTROL` like this:
:::

```js
const MOCK_READ_FILE_CONTROL = [false, false, true, false, true]
```

::: continue
then the third and fifth calls to `mockReadFileSync` throw an exception instead of reading data,
as do any calls after the fifth.
Write this function.
:::
