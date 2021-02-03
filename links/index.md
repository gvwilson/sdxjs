---
---

<ul class="links">
<% links.filter(function(entry){return (entry.list === undefined) || entry.list}).forEach(function(entry){ %>
<li id="<%- entry.slug %>">
<a href="<%- entry.url %>"><%- entry.name %></a>:
<%- entry.lede %>
</li>
<% }) %>
</ul>
