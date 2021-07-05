{% if include.problem %}

Write a function that searches code for simple calls to `require`
and replaces them with calls to `import`.
This function only needs to work for the simplest case;
for example, if the input is:

```js
const name = require('module')
```

{: .continue}
then the output is:

```js
import name from 'module'
```

{% else %}

FIXME: write solution.

{% endif %}
