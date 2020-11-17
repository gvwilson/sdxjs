A <g key="mock_object">mock object</g> is a simplified replacement for part of a program
whose behavior is easier to control and predict than the thing it is replacing.
For example,
if the function `getNumUsers(clusterName)` returns the number of people using a cluster at the present time,
we can replace it with a pair of functions for testing purposes:

-   `setupNumUsers(sampleData)` takes an object whose keys are cluster names
    and whose values are the number of users to return for those clusters.

-   `getNumUsers(clusterName)` looks in the data most recently set with `setupNumUsers`
    and returns the appropriate value.

Create a file called `mock-num-users.js` that contains these two functions.
