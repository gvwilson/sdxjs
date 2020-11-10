Suppose we create a promise that deliberately fails
and attach both `then` and `catch` to it:

<%- include('/_inc/file.html', {file: 'catch-then/example.js'}) %>

<p class="noindent">When the code is run it produces:</p>

<%- include('/_inc/file.html', {file: 'catch-then/example.txt'}) %>

1.  Trace the order of execution.
2.  Why is `undefined` printed at the end?
