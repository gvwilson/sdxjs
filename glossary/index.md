---
---

<dl class="glossary">
{% for entry in site.data.glossary %}
<dt class="glossary" id="{{ entry.key }}">{{ entry.en.term }}{%- if entry.en.acronym %} ({{ entry.en.acronym }}){%- endif -%}</dt>
<dd class="glossary">{{ entry.en.def | markdownify | replace: '<p>', '' | replace: '</p>', ''}}
{%- for key in entry.ref -%}
{%- if forloop.first %} See also: {% endif -%}
{%- assign temp = site.data.glossary | where: "key", key -%}
<a href="#{{ key }}">{{ temp[0].en.term }}</a>{%- if forloop.last -%}.{% else %}, {% endif -%}
{%- endfor -%}
</dd>
{% endfor %}
</dl>
