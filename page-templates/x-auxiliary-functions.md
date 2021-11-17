{% if include.problem %}

1.  Modify `Expander` so that it takes an extra argument `auxiliaries`
    containing zero or more named functions:

    ```js
    const expander = new Expander(root, vars, {
      max: Math.max,
      trim: (x) => x.trim()
    })
    ```

2.  Add a directive `<span z-call="functionName" z-args="var,var"/>`
    that looks up a function in `auxiliaries` and calls it
    with the given variables as arguments.

{% else %}

FIXME: write solution

{% endif %}
