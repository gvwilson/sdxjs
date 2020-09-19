---
---

<% site.authors.forEach(person => { %>
<div class="author">
  <h2><% if (person.link) { %><a href="<%- person.link %>"><% } %><%- person.name %><% if (person.link) { %></a><% } %></h2>
  <img src="<%- `${relativeRoot}/static/${person.avatar}` %>" alt="<%- person.name %>" />
  <p class="noindent"><%- person.bio.replace('\n', '').trim() %></p>
</div>
<% }) %>
