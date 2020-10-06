---
---

<% site.chapters.filter(chapter => 'exercises' in chapter).forEach(chapter => { %>
<h2><%- chapter.title %></h2>

<% chapter.exercises.forEach(ex => { %>
<h3><%- ex.title %></h3>

<%- fs.readFileSync(`${root}/${chapter.slug}/${ex.slug}/solution.md`, 'utf-8') %>

<% }) %>
<% }) %>
