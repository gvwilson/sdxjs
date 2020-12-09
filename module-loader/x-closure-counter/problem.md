Write a function `makeCounter` that returns a function
that produces the next integer in sequence starting from zero each time it is called.
Each function returned by `makeCounter` must count independently, so:

```js
left = makeCounter()
right = makeCounter()
console.log(`left ${left()`)
console.log(`right ${right()`)
console.log(`left ${left()`)
console.log(`right ${right()`)
```

::: continue
must produce:
:::

```txt
left 0
right 0
left 1
right `
```
