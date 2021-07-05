{%- comment -%}
  Include exercises.
{%- endcomment -%}
<h2 id="exercises">Exercises</h2>

{% for exercise in include.exercises %}
{%- assign path = exercise.slug | append: '.md' -%}
{%- capture content -%}{% include_relative {{ path }} problem=true %}{%- endcapture -%}
<h3 id="{{ exercise.slug }}">{{ exercise.title | markdownify | replace: '<p>', '' | replace: '</p>', '' | strip }}</h3>
{{ content | markdownify }}
{% endfor %}
