---
---

-   There's no point building software if you can't install it
-   Inspired by [CTAN][ctan], most languages now have an online archive from which developers can download packages
    -   Package name
    -   Version(s)
    -   List of dependencies, which may also specify versions or version ranges
-   Downloading files requires some web programming skills that are out of scope for this book
-   Installing files uses the systems programming skills of <xref key="systems-programming"></xref>
-   But figuring out which packages to download can be very difficult
    -   What if A and B require different versions of C?
    -   Or requires different ranges of versions of C, but there is overlap?
-   Explore how to find a workable installation or prove that there isn't one
    -   Based in part on [this tutorial][package-manager-tutorial] by [Maël Nison][nison-mael]

::: callout
### Satisfiability

In essence what we are trying to do is find a version for each package
that makes the assertion "P is compatible with all its dependencies" true
for every package P.
The general-purpose tools for doing this are called <g key="sat_solver">SAT solvers</g>
because they determine whether there is some assignment of values
that satisfies the claim (i.e., makes it true).
Finding a solution can be extremely hard in the general case,
so most SAT solvers use heuristics to try to reduce the work.
:::

## What is semantic versioning?

-   Most software projects use <g key="semantic_versioning">semantic versioning</g> for software releases
-   Version number consists of three integers X.Y.Z:
    -   X is the major version
    -   Y is the minor version
    -   Z is the <g key="patch">patch</g> number
    -   [Full spec][semver-spec] allows for more fields, but we will ignore them
-   Increment major version number every time there's an incompatible externally-visible change
-   Increment minor version number when adding new functionality in a <g key="backward_compatible">backward-compatible</g> manner
    (i.e. without breaking any existing code)
-   Increment the patch number for backwards-compatible bug fixes that don't add any new features
-   When specifying a project's dependencies:
    -   `>= 1.2.3` means "any version after 1.2.3"
    -   `< 4` means "any version before 4.anything"
    -   `1.0 - 3.1` means "any version in the specified range (including patches)"
    -   Note that 2.1 is greater than 1.99
-   The [semver][node-semver] module provides lots of useful functions
    -   `semver.valid('1.2.3')`
    -   `semver.satisfies('2.2', '1.0 - 3.1')`

## How can we find a consistent set of packages?

-   Imagine each package is an axis in a multi-dimensional space, with its versions as the tick marks
    -   Each point in the space is a possible combination of package versions
    -   Check if a point satisfies all of the constraints
-   Example
    -   Package X
        -   X/1 requires Y/1-2 and Z/1
        -   X/2 requires Y/2-3 and Z/1-2
    -   Package Y
        -   Y/1 requires Z/2
        -   Y/2 requires Z/2-3
        -   Y/3 requires Z/3
    -   Package Z
        -   Z/1, Z/2, and Z/3 don't require anything

<%- include('/inc/fig.html', {
    id: 'package-manager-allowable',
    img: '/static/tools-small.jpg',
    alt: 'Allowable versions',
    cap: 'Finding allowable combinations of package versions.',
    fixme: true
}) %>

-   18 possibilities (2 for X times 3 for Y times 3 for Z)
    -   But 16 are excluded by various incompatibilities
    -   Of the two remaining possibilities, X/2 + Y/3 + Z/3 is strictly greater than X/2 + Y/2 + Z/2
    -   If we wound up with A/1 + B/2 vs. A/2 + B/1, we'd have to add another rule

|   X |   Y |   Z | Excluded  |
| --- | --- | --- | --------- |
|   1 |   1 |   1 | Y/1 - Z/1 |
|   1 |   1 |   2 | X/1 - Z/2 |
|   1 |   1 |   3 | X/1 - Z/3 |
|   1 |   2 |   1 | Y/2 - Z/1 |
|   1 |   2 |   2 | X/1 - Z/2 |
|   1 |   2 |   3 | X/1 - Z/3 |
|   1 |   3 |   1 | X/1 - Y/3 |
|   1 |   3 |   2 | X/1 - Y/3 |
|   1 |   3 |   3 | X/1 - Y/3 |
|   2 |   1 |   1 | X/2 - Y/1 |
|   2 |   1 |   2 | X/2 - Y/1 |
|   2 |   1 |   3 | X/2 - Y/1 |
|   2 |   2 |   1 | Y/2 - Z/1 |
|   2 |   2 |   2 |           |
|   2 |   2 |   3 | X/2 - Z/3 |
|   2 |   3 |   1 | Y/3 - Z/1 |
|   2 |   3 |   2 | Y/3 - Z/2 |
|   2 |   3 |   3 | X/2 - Z/3 |

-   How did we do this?
    -   Find all versions of all packages plus their constraints (<g key="transitive_closure">transitive closure</g>)
    -   Pick any two and create a list of valid pairs
    -   Add a third: cross off pairs that can't be satisfied, generate triples of possibilities
    -   Repeat until all packages included
-   Worst case, wind up with <g key="combinatorial_explosion">combinatorial explosion</g> of possibilities
    -   Smart algorithms will try to pick additions that minimize the number of new possibilities added
    -   Or create pairs, then combine pairs of pairs, etc.
    -   Our algorithm will be simple (and therefore slow)

## How can we implement constraint satisfaction?

-   Read a JSON data structure describing the problem
    -   A real package manager would read <g key="manifest">manifests</g> of packages and construct this structure
    -   Really wish JSON had a standard way to represent comments…
-   Stick to single-digit version numbers for readability

<%- include('/inc/file.html', {file: 'double-chained.json'}) %>

-   Check if a configuration (specific versions of all packages) is compatible with a manifest

<%- include('/inc/erase.html', {file: 'sweep.js', key: 'allows'}) %>

-   Simplest way to find configuration is to sweep over all possibilities

<%- include('/inc/keep.html', {file: 'sweep.js', key: 'allows'}) %>

-   Run this on the short example

<%- include('/inc/multi.html', {pat: 'sweep-double-chained.*', fill: 'sh out'}) %>

-   And on the longer example

<%- include('/inc/multi.html', {pat: 'sweep-double-chained.*', fill: 'sh out'}) %>

-   It works
-   But does lots of unnecessary work
    -   Sort by the case that caught the exclusion
    -   9 of the 17 exclusions are redundant rediscovery of a previous-known problem

| Excluded  |   X |   Y |   Z |
| --------  | --- | --- | --- |
| X/1 - Y/3 |   1 |   3 |   1 |
| …         |   1 |   3 |   2 |
| …         |   1 |   3 |   3 |
| X/1 - Z/2 |   1 |   1 |   2 |
| …         |   1 |   2 |   2 |
| X/1 - Z/3 |   1 |   1 |   3 |
| …         |   1 |   2 |   3 |
| X/2 - Y/1 |   2 |   1 |   1 |
| …         |   2 |   1 |   2 |
| …         |   2 |   1 |   3 |
| X/2 - Z/3 |   2 |   2 |   3 |
| …         |   2 |   3 |   3 |
| Y/1 - Z/1 |   1 |   1 |   1 |
| Y/2 - Z/1 |   1 |   2 |   1 |
| …         |   2 |   2 |   1 |
| Y/3 - Z/1 |   2 |   3 |   1 |
| …         |   2 |   3 |   2 |
|           |   2 |   2 |   2 |

## How can we do less work?

-   We can <g key="prune">prune</g> the tree
    -   If X and Y are incompatible, no need to check Z
-   Collect possible solutions and display them at the end
-   Only recurse if everything looks good so far

<%- include('/inc/erase.html', {file: 'prune.js', key: 'compatible'}) %>

-   Check to see if adding something will still be consistent

<%- include('/inc/keep.html', {file: 'prune.js', key: 'compatible'}) %>

-   Gets us from 18 complete solutions to:
    -   11 complete
    -   1 workable
    -   2 incomplete (representing 6 that we didn't need to finish)

<%- include('/inc/file.html', {file: 'prune-triple.out'}) %>

-   Another way to look at the work is the number of steps in the search
    -   Full search had 18×3 = 54
    -   Pruning leaves us with (12×3) + (2×2) = 40
    -   So we have eliminated roughly 1/4 of the work
-   What if we searched in a different order?

<%- include('/inc/file.html', {file: 'reverse.js'}) %>

<%- include('/inc/file.html', {file: 'reverse-triple.out'}) %>

-   Now have (8×3) + (5×2) = 34
    -   Have eliminated roughly 1/3 of the work
-   Lots of <g key="heuristic">heuristics</g> for searching trees
    -   None are guaranteed to give better performance in every case
    -   But most will give better performance in most cases
    -   And gains multiply: 2/3 of the work in each of two layers is less than half the total original work
