1.  Add a method `Pledge.any` that takes an array of pledges
    and as soon as one of the pleges in the array resolves,
    returns a single promise that resolves with the value from that pledge.

2.  Add another method `Pledge.all` that takes an array of pledges
    and returns a single promise that resolves to an array
    containing the final values of all of those pledges.

[This article][promise-all-any] may be helpful.
