{% if include.problem %}

Testing frameworks often allow programmers to specify a `setup` function
that is to be run before each test
and a corresponding `teardown` function
that is to be run after each test.
(`setup` usually re-creates complicated test fixtures,
while `teardown` functions are sometimes needed to clean up after tests,
e.g., to close database connections or delete temporary files.)

Modify the testing framework in this chapter so that
if a file of tests contains something like this:

```js
const createFixtures = () => {
  ...do something...
}

hope.setup(createFixtures)
```

{: .continue}
then the function `createFixtures` will be called
exactly once before each test in that file.
Add a similar way to register a teardown function with `hope.teardown`.

{% else %}

FIXME: write solution.

{% endif %}
