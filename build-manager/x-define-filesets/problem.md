Modify the build manager so that users can define sets of files:

```yml
fileset:
  name: everything
  contains:
    - X
    - Y
    - Z
```

{: .continue}
and then refer to them later:

```yml
- target: P
  depends:
  - @everything
```
