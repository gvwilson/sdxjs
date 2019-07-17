{%- comment -%}
A table of named links and glossary terms to be included at the foot of every Markdown page.
(It cannot be put in the layout template because of Jekyll's processing order.)
{%- endcomment -%}
{% for link in site.data.links %}
[{{link.slug}}]: {{link.link}}
{% endfor %}
{% for term in site.data.glossary %}
[{{term.slug}}]: {% if page.permalink == '/' %}.{% else %}..{% endif %}/glossary/#{{term.slug}}
{% endfor %}
