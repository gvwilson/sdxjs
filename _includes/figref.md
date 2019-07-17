{%- comment -%}
Insert a reference to a figure.
Use as {% include figref.md key="key" %} for a figure in the same file
or as {% include figref.md slug="slug" key="key" %} for a figure in another file.
{%- endcomment -%}
{%- if include.slug -%}
{% assign figure_slug = include.slug -%}
{%- else -%}
{%- assign figure_slug = page.permalink | remove: '/' -%}
{%- endif -%}
{%- assign figure_id = 'f:' | append: figure_slug | append: ':' | append: include.key -%}
{%- assign figure_entry = site.data.figures | where: "key", figure_id | first -%}
[Figure {{figure_entry.number}}]({% if page.permalink == '/' %}.{% else %}..{% endif %}/{{figure_slug}}/#{{figure_id}})
