The Unix `head` command shows the first few lines of one or more files,
while the `tail` command shows the last few.
Write programs `head.js` and `tail.js` that do the same things using promises and `async`/`await`,
so that:

```sh
node head.js 5 first.txt second.txt third.txt
```

<p class="noindent">prints the first 5 lines of each of the three files and:</p>

```sh
node tail.js 5 first.txt second.txt third.txt
```

<p class="noindent">prints the last five lines of each file.</p>
