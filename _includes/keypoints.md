{%- comment -%}
  Show key points for entry if available.
  - points: list of points to display or empty.
{%- endcomment -%}
{% if include.points %}
<div class="keypoints" markdown="1">
<ul class="keypoints">
{% for point in include.points %}
  <li>{{ point | markdownify | replace: '<p>', '' | replace: '</p>', '' | strip }}</li>
{% endfor %}
</ul>
</div>
{% endif %}
