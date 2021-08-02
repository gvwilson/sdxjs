Some documentation generators put the documentation for a parameter
on the same line as the parameter:

```js
/**
 * Transform data.
 */
function process(
  input,  /*- {stream} where to read */
  output, /*- {stream} where to write */
  op      /*- {Operation} what to do */
){
  // body would go here
}
```

{: .continue}
Modify the documentation generator to handle this.
