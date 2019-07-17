```{{include.file | split: '.' | last }}
{% include_relative {{include.file}} -%}
```
{: title="{{include.file}}"}
