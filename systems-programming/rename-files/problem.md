Write a program called `rename` that takes three or more command-line arguments:

1.  A <g key="filename_extension">filename extension</g> to match.
2.  An extension to replace it with.
3.  The names of one or more existing files.

When it runs,
`rename` renames any files with the first extension to create files with the second extension,
but will *not* overwrite an existing file.
For example,
suppose a directory contains `a.txt`, `b.txt`, and `b.bck`.
The command:

```sh
rename .txt .bck a.txt b.txt
```

<p class="noindent">will rename `a.txt` to `a.bck`,
but will *not* rename `b.txt` because `b.bck` already exists.</p>