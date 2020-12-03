Modify the build manager so that it can dynamically construct a set of files:

```yml
glob:
  name: allAvailableInputs
  pattern: "./*.in"
```

::: unindented
and then refer to them later:
:::

```yml
- target: P
  depends:
  - @allAvailableInputs
```
