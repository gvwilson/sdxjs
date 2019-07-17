---
permalink: "/keypoints/"
---

{% for entry in site.data.lessons %}
{% assign stripped = entry.link | replace: '/', '' %}
<h2 id="keypoints-{{stripped}}">{{entry.name}}</h2>
{%- for point in entry.keypoints -%}
-   {{point}}
{% endfor %}
{% endfor %}

{% include links.md %}
