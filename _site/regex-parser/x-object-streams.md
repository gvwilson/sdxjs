{% if include.problem %}

Write a parser that turns files of key-value pairs separated by blank lines into objects.
For example, if the input is:

```txt
left: "left value"
first: 1

middle: "middle value"
second: 2

right: "right value"
third: 3
```

{: .continue}
then the output will be:

```js
[
  {left: "left value", first: 1},
  {middle: "middle value", second: 2},
  {right: "right value", third: 3}
]
```

Keys are always upper- and lower-case characters;
values may be strings in double quotes or unquoted numbers.

{% else %}

FIXME: write solution.

{% endif %}
