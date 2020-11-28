1.  Write a tokenizer for a subset of HTML that consists of:

    -   Opening tags without attributes, such as `<div>` and `<p>`
    -   Closing tags, such as `</p>` and `</div>`
    -   Plain text between tags that does *not* contain '<' or '>' characters

2.  Modify the tokenizer to handle `key="value"` attributes in opening tags.

3.  Write Mocha tests for your tokenizer.
