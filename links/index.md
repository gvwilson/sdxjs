---
---

{% assign lines = site.kramdown.link_defs | replace: '{', '' | replace: '}', ''| strip | split: '],' %}
<table class="links">
<thead>
<tr><th>Title</th><th>URL</th></tr>
</thead>
<tbody>
{% for line in lines -%}
{%- assign parts = line | strip | replace: ']', '' | split: ': [' -%}
{%- assign key = parts[0] | replace: '"', '' -%}
{%- assign values = parts[1] | replace: '"', '' | split: ', ' -%}
<tr><td><a href="{{ values[0] }}">{{ values[1] }}</a></td><td><a href="{{ values[0] }}">{{ values[0] }}</a></td></tr>
{% endfor %}
</tbody>
</table>
