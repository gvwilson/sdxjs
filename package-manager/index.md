---
---

There is no point building software if you can't install it.
Inspired by the Comprehensive TeX Archive Network [CTAN][ctan],
most languages now have an online archive from which developers can download packages.
Each package typically has a name and one or more version(s),
each of which may have a list of dependencies,
and the package may specify a version or range of versions for each of those dependencies.

Downloading files requires some web programming that is out of scope for this book,
while installing those files uses the systems programming skills of <x key="systems-programming"></x>.
The piece we are missing is a way to figure out exactly what versions of different packages to install
in order to create a consistent setup.
If packages A and B require different versions of C,
it might not be possible to use A and B together.
On the other hand,
if each one requires a range of versions of C,
and those ranges overlap,
we might be able to find a combination that works.

This chapter explores how to find a workable installation or prove that there isn't one.
It is based in part on [this tutorial][package-manager-tutorial] by [Maël Nison][nison-mael].

::: callout
### Satisfiability

What we are trying to do is find a version for each package
that makes the assertion "P is compatible with all its dependencies" true
for every package P.
The general-purpose tools for doing this are called <g key="sat_solver">SAT solvers</g>
because they determine whether there is some assignment of values
that satisfies the claim (i.e., makes it true).
Finding a solution can be extremely hard in the general case,
so most SAT solvers use heuristics to try to reduce the work.
:::

## What is semantic versioning?

Most software projects use <g key="semantic_versioning">semantic versioning</g> for software releases.
Each version number consists of three integers X.Y.Z,
where X is the major version,
Y is the minor version,
and Z is the <g key="patch">patch</g> number.
The [full specification][semver-spec] allows for more fields,
but we will ignore them.

A package's authors increment its major version number
every time something changes in a way that makes the package incompatible with previous versions
(e.g., add a required parameter to a function).
They increment the minor version number when they new functionality
in a <g key="backward_compatible">backward-compatible</g> manner
(i.e., without breaking any existing code),
and change the patch number for backwards-compatible bug fixes that don't add any new features.
The notation for specifying a project's dependencies looks a lot like arithmetic:
`>= 1.2.3` means "any version after 1.2.3",
`< 4` means "any version before 4.anything",
and `1.0 - 3.1` means "any version in the specified range (including patches)".
Note that version 2.1 is greater than version 1.99.

The [`semver`][node-semver] module provides useful functions for working with semantic version identifier.
`semver.valid('1.2.3')` checks that `1.2.3` is a valid version identifier,
while `semver.satisfies('2.2', '1.0 - 3.1')` checks that its first argument
is compatible with the range specified in its second.

## How can we find a consistent set of packages?

Imagine that each package we need is represented as an axis on a graph,
with its versions as the tick marks
(<f key="package-manager-allowable"></f>).
Each point on the graph is then a possible combination of package versions.
We can block out regions of this graph using the constraints on the package versions;
whatever points are left when we're done are legal installations.

<%- include('/inc/figure.html', {
    id: 'package-manager-allowable',
    img: '/static/tools-small.jpg',
    alt: 'Allowable versions',
    cap: 'Finding allowable combinations of package versions.',
    fixme: true
}) %>

For example,
suppose we have the set of requirements shown in <t key="package-manager-example-dependencies"></t>.
There are 18 possible configurations
(2 for X × 3 for Y × 3 for Z)
but 16 are excluded by various incompatibilities.
Of the two remaining possibilities,
X/2 + Y/3 + Z/3 is strictly greater than X/2 + Y/2 + Z/2,
so we would probably choose the former
(<t key="package-manager-example-result"></t>).
if we wound up with A/1 + B/2 versus A/2 + B/1,
we would have to add rules about how to resolve ties.

<%- include('/inc/table.html', {
    id: 'package-manager-example-dependencies',
    file: 'example-dependencies.tbl',
    cap: 'Example package dependencies.'
}) %>

<%- include('/inc/table.html', {
    id: 'package-manager-example-result',
    file: 'example-result.tbl',
    cap: 'Result for example package dependencies.'
}) %>

To construct this table
we found the transitive closure of all packages plus all of their dependencies.
We then picked two and created a list of valid pairs.
Choosing a third,
we cross off pairs that can't be satisfied
to leave triples of legal combinations.
We repeat this until all packages are included in our table.

In the worst case this will create a <g key="combinatorial_explosion">combinatorial explosion</g> of possibilities.
Smart algorithms will try to pick additions that minimize the number of new possibilities added,
or create pairs and then combine them to create pairs of pairs and so on.
Our algorithm will be simple (and therefore slow),
but illustrates the key idea.

## How can we implement constraint satisfaction?

To avoid messing around with parsers,
our programs reads a JSON data structure describing the problem.
A real package manager would read the <g key="manifest">manifests</g> of the packages needed
and construct this structure.
We will stick to single-digit version numbers for readability,
and will use this as our first test case:

<%- include('/inc/file.html', {file: 'double-chained.json'}) %>

::: callout
### Comments

If you ever design a data format,
please include a standard way for people to add comments,
because they will always want to.
YAML has this,
but JSON CSV don't.
:::

To check if a configuration of specific versions of all packages is compatible with a manifest,
we add each package to our active list in turn and look for violations.
If there aren't any more packages on the active list and we haven't found a violation,
then what we have must be a legal configuration.

<%- include('/inc/erase.html', {file: 'sweep.js', key: 'allows'}) %>

The simplest way to find configurations is to sweep over all possibilities.
For debugging purposes,
our function prints possibilities as it goes:

<%- include('/inc/keep.html', {file: 'sweep.js', key: 'allows'}) %>

If we run this program on the two-package example shown earlier we get this output:

<%- include('/inc/multi.html', {pat: 'sweep-double-chained.*', fill: 'sh out'}) %>

When we run it on our triple-package example we get this:

<%- include('/inc/multi.html', {pat: 'sweep-triple.*', fill: 'sh out'}) %>

This works,
but it is doing a lot of unnecessary work.
If we sort the output by the case that caught the exclusion
it turns out that 9 of the 17 exclusions are redundant rediscovery of a previous-known problem:

<%- include('/inc/table.html', {
    id: 'package-manager-exclusions',
    file: 'exclusions.tbl',
    cap: 'Package exclusions.'
}) %>

## How can we do less work?

In order to make this more efficient we need to <g key="prune">prune</g> the search tree
as we go along
(<f key="package-manager-pruning"></f>).
After all,
if X and Y are incompatible, there is no need to check Z.

<%- include('/inc/figure.html', {
    id: 'package-manager-pruning',
    img: '/static/tools-small.jpg',
    alt: 'Pruning the search tree',
    cap: 'Pruning options in the search tree to reduce work.',
    fixme: true
}) %>

This version of the program collects possible solutions and displays them at the end.
It only keeps checking a partial solution if what it has found so far looks good:

<%- include('/inc/erase.html', {file: 'prune.js', key: 'compatible'}) %>

The `compatible` function checks to see if adding something will leave us with a consistent configuration:

<%- include('/inc/keep.html', {file: 'prune.js', key: 'compatible'}) %>

Checking as we go gets us from 18 complete solutions to 11.
One is workable
and two are incomplete (representing 6 possible solutions that we didn't need to finish):

<%- include('/inc/file.html', {file: 'prune-triple.out'}) %>

Another way to look at the work is the number of steps in the search.
The full search had 18×3 = 54 steps.
Pruning leaves us with (12×3) + (2×2) = 40 steps
so we have eliminated roughly 1/4 of the work.

What if we searched in the reverse order?

<%- include('/inc/file.html', {file: 'reverse.js'}) %>

<%- include('/inc/file.html', {file: 'reverse-triple.out'}) %>

Now we have (8×3) + (5×2) = 34 steps,
i.e.,
we have eliminated roughly 1/3 of the work.
That may not seem like a big difference,
but if we go five levels deep at the same rate
it cuts the work in half.
There are lots of <g key="heuristic">heuristics</g> for searching trees.
None are guaranteed to give better performance in every case,
but most will give better performance in most cases.
