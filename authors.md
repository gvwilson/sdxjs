---
permalink: "/authors/"
---

{% for person in site.data.authors %}
<div class="author">
  <h2>{% if person.link %}<a href="{{ person.link }}">{% endif %}{{ person.name }}{% if person.link %}</a>{% endif %}</h2>
  <img src="{{ '/static/' | append: person.avatar | relative_url }}" alt="{{person.name}}" />
  <p>{{person.bio}}</p>
</div>
{% endfor %}

{% include links.md %}
