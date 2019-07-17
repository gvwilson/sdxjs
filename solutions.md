---
permalink: "/solutions/"
---

{% for entry in site.data.lessons %}
{% assign slug = entry.link | replace: '/', '' %}
{%- assign crossref = '../' | append: slug | append: '/#exercises' | relative_url -%}
<h2 id="{{slug}}"><a href="{{crossref}}" data-latex-text="{{entry.name}}">{{entry.name}}</a></h2>
{% if entry.exercises %}
{% for item in entry.exercises %}
<h3>{{item.title | markdownify | replace: '<p>', '' | replace: '</p>', '' | strip}}</h3>
{%- assign solution_file = slug | append: '/' | append: item.slug | append: '-solution.md' -%}
{%- capture solution_markdown -%}{% include_relative {{solution_file}} %}{%- endcapture %}
{{ solution_markdown | markdownify }}
{% endfor %}
{% else %}
<p>No exercises yet.</p>
{% endif %}
{% endfor %}

{% include links.md %}
