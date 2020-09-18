---
---

<ul class="links">
<% site.links.forEach(function(entry){ %>
<li id="<%- entry.slug %>">
<a href="<%- entry.url %>"><%- entry.name %></a>:
<%- entry.lede %>
</li>
<% }) %>
</ul>
