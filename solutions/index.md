---
---

<% site.chapters.filter(chapter => 'exercises' in chapter).forEach(chapter => { %>
<h2><%- chapter.title %></h2>

<% chapter.exercises.forEach(exercise => { %>
<%- _exercise(root, chapter, exercise, 'solution') %>

<% }) %>
<% }) %>
