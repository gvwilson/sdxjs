---
permalink: "/links/"
---

<ul>
{% for entry in site.data.links %}
  <li>
    <a href="{{entry.link}}">{{entry.name | markdownify | replace: '<p>', '' | replace: '</p>', ''}}</a>:
    {{entry.lede | markdownify | replace: '<p>', '' | replace: '</p>', ''}}
  </li>
{% endfor %}
</ul>

{% include links.md %}
