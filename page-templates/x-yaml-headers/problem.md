Modify the template expander to handle variables defined in a YAML header in the page being processed.
For example, if the page is:

```html
---
name: "Dorothy Johnson Vaughan"
---
<html>
  <body>
    <p><span q-var="name"/></p>
  </body>
</html>
```

::: continue
will create a paragraph containing the given name.
:::
