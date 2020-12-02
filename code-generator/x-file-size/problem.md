1.  Write a program that replaces all calls to `fs.readFileSync`
    with calls to `readFileSyncCount`.

2.  Write the function `readFileSyncCount` to read and return a file using `fs.readFileSync`
    but to also record the file's name and size in bytes.

3.  Write a third function `reportInputFileSizes` that reports
    what files were read and how large they were.

4.  Write tests for these functions using Mocha and `mock-fs`.
