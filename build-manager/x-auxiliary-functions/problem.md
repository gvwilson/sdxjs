1.  Modify the builder manager so that it takes an extra argument `auxiliaries`
    containing zero or more named functions:

    ```js
    const builder = new ExtensibleBuilder(configFile, timesFile, {
      slice: (node, graph) => simplify(node, graph, 1)
    })
    ```

2.  Modify the `run` method to call these functions
    before executing the rules for a node,
    and to only execute the rules if all of them return `true`.

3.  Write Mocha tests to check that this works correctly.
