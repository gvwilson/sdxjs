A windowing application represents rectangles using objects with four values:
`x` and `y` are the coordinates of the lower-left corner,
while `w` and `h` are the width and height.
All values are non-negative:
the lower-left corner of the screen is at `(0, 0)`
and the screen's size is `WIDTH`x`HEIGHT`.

1.  Write tests to check that an object represents a valid rectangle.

2.  The function `overlay(a, b)` takes two rectangles and returns either
    a new rectangle representing the region where they overlap or `null` if they do not overlap.
    Write tests to check that `overlay` is working correctly.

3.  Do you tests assume that two rectangles that touch on an edge overlap or not?
    What about two rectangles that only touch at a single corner?
