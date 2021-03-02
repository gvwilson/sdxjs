<span g="fixed_width_string">Fixed-width</span> storage is inefficient for large blocks of text
such as contracts, novels, and resumés,
since padding every document to the length of the longest will probably waste a lot of space.
An alternative way to store these in binary is to save each entry as a (length, text) pair.

1.  Write a function that takes a list of strings as input
    and returns an `ArrayBuffer` containing (length, text) pairs.

2.  Write another function that takes such an `ArrayBuffer`
    and returns an array containing the original text.

3.  Write tests with Mocha to confirm that your functions work correctly.
