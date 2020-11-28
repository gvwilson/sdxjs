Add a directive `<div q-snippet="variable">…</div>` that saves some text in a variable
so that it can be displayed later.
For example:

```html
<html>
  <body>
    <div q-snippet="prefix"><strong>Important:</strong></div>
    <p>Expect three items</p>
    <ul>
      <li q-loop="item:names">
        <span q-var="prefix"><span q-var="item"/>
      </li>
    </ul>
  </body>
</html>
```

::: unindented
would printed the word "Important:" in bold before each item in the list.
:::
