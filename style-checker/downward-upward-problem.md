Modify `Walker` so that users can specify
one action to take at a node on the way down the tree
and a separate action to take on the way up.
(Hint: require users to specify `Nodename_downward`
and/or `Nodename_upward` methods in their class,
then use string concatenation
to construct method names while traversing the tree.)
