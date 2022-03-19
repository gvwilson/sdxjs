{% if include.problem %}

Write a function that removes empty constructors from class definitions.
For example, if the input is:

```js
class Example {
  constructor () {
  }

  someMethod () {
    console.log('some method')
  }
}
```

{: .continue}
then the output should be:

```js
class Example {
  someMethod () {
    console.log('some method')
  }
}
```

{% else %}

FIXME: write solution

{% endif %}
