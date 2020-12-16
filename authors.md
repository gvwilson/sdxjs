---
---

<% site.authors.forEach(author => { %>
<%- `<div class="html-only">
  <img src="../../static/${author.img}" id="${author.id}" width="100px" />
</div>
<div class="latex-only">
  \includegraphics[width=0.2\linewidth]{static/${author.img}}
</div>` %>
<%- '<div class="continue">' %>
<%- include('/inc/raw.html', {file: `authors/${author.id}.md`}) %>
<%- '</div>' %>
<% }) %>
