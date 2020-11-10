1.  What does this code print and why?

    ```js
    Promise.resolve('hello')
    ```

2.  What does this code print and why?

    ```js
    Promise.resolve('hello').then(result => console.log(result))
    ```

3.  What does this code print and why?

    ```js
    const p = new Promise((resolve, reject) => resolve('hello'))
      .then(result => console.log(result))
    ```

::: hint
Try each snippet of code interactively in the Node interpreter and as a command-line script.
:::
