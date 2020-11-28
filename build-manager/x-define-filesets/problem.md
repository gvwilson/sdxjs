Modify the build manager so that users can define sets of files:

```yml
fileset:
  name: everything
  contains:
    - X
    - Y
    - Z
```

::: unindented
and then refer to them later:
:::

```
- target: P
  depends:
  - @everything
```
