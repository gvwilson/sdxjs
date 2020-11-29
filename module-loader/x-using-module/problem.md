What happens if we define the variable `module` in `loadModule`
so that it is in scope when `eval` is called
rather than creating a variable called `result` and passing that in:

```js
const loadModule = (filename) => {
  const source = fs.readFileSync(filename, 'utf-8')
  const module = {}
  const fullText = `(() => {${source}})()`
  eval(fullText)
  return module.exports
}
```
