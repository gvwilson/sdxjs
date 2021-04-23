---
---

{% for entry in site.data.index %}
<p>{{ entry.term }}: {% for link in entry.links %}<a href="../{{ link.slug }}/">{{ link.title }}</a>{% unless forloop.last %}, {% endunless %}{% endfor %}</p>
{% endfor %}

