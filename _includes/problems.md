{%- comment -%}
  Include exercises.
{%- endcomment -%}
<h2 id="exercises">Exercises</h2>

{% for exercise in include.exercises %}
{%- assign path = exercise.slug | append: '/problem.md' -%}
{%- capture content -%}{% include_relative {{ path }} %}{%- endcapture -%}
<h3 id="{{ exercise.slug }}">{{ exercise.title | markdownify }}</h3>
{{ content | markdownify }}
{% endfor %}
