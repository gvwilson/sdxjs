{% assign vals = include.values | replace: " ", "" | split: "," %}
{% for val in vals %}
{% assign filename = include.pattern | replace: "*", val %}
{% assign suffix = filename | split: '.' | last %}
```{{suffix}}
{% include_relative {{filename}} -%}
```
{: title="{{filename}}"}
{% endfor %}
