This is a more sophisticated version of `deleteChar` that returns the character being deleted:

```js
deleteChar () {
  const cx = this.textBuffer.cx
  const cy = this.textBuffer.cy
  let char = null
  if (cx === 0) {
    if (cy > 0) {
      const last = this.textBuffer.buffer[cy - 1].length - 1
      char = this.textBuffer.buffer[cy - 1][last].char
    }
  } else {
    char = this.textBuffer.buffer[cy][cx - 1].char
  }

  this.textBuffer.backDelete(1)
  this.draw()
  return char
}
```

::: continue
Use it to make character deletion undoable.
:::
