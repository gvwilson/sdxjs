---
---

There is no point building software if you can't install it.
Inspired by the Comprehensive TeX Archive Network [CTAN][ctan],
most languages now have an online archive from which developers can download packages.
Each package typically has a name and one or more version(s);
each version may have a list of dependencies,
and the package may specify a version or range of versions for each dependency.

Downloading files requires some web programming that is out of scope for this book,
while installing those files in the right places
uses the systems programming skills of <span x="systems-programming"></span>.
The piece we are missing is a way to figure out exactly what versions of different packages to install
in order to create a consistent setup.
If packages A and B require different versions of C,
it might not be possible to use A and B together.
On the other hand,
if each one requires a range of versions of C and those ranges overlap,
we might be able to find a combination that works---at least,
until we try to install packages D and E.

We *could* install every package's dependencies separately with it;
the disk space wouldn't be much of an obstacle,
but loading dozens of copies of the same package into the browser
would slow applications down.
This chapter therefore explores how to find a workable installation or prove that there isn't one.
It is based in part on [this tutorial][package-manager-tutorial] by [Maël Nison][nison-mael].

<div class="callout" markdown="1">

### Satisfiability

What we are trying to do is find a version for each package
that makes the assertion "P is compatible with all its dependencies" true
for every package P.
The general-purpose tools for doing this are called <span g="sat_solver">SAT solvers</span>
because they determine whether there is some assignment of values
that satisfies the claim (i.e., makes it true).
Finding a solution can be extremely hard in the general case,
so most SAT solvers use heuristics to try to reduce the work.

</div>

## What is semantic versioning?

Most software projects use <span g="semantic_versioning">semantic versioning</span> for software releases.
Each version number consists of three integers X.Y.Z,
where X is the major version,
Y is the minor version,
and Z is the <span g="patch">patch</span> number.
(The [full specification][semver-spec] allows for more fields,
but we will ignore them in this tutorial.)

A package's authors increment its major version number
every time something changes in a way that makes the package incompatible with previous versions
For example,
if they add a required parameter to a function,
then code built for the old version will fail or behave unpredictably with the new one.
The minor version number is incremented when new functionality
is <span g="backward_compatible">backward-compatible</span>---i.e.,
it won't break any existing code---and the patch number is changed
for backward-compatible bug fixes that don't add any new features.

The notation for specifying a project's dependencies looks a lot like arithmetic:
`>= 1.2.3` means "any version from 1.2.3 onward",
`< 4` means "any version before 4.anything",
and `1.0 - 3.1` means "any version in the specified range (including patches)".
Note that version 2.1 is greater than version 1.99:
no matter how large a minor version number becomes,
it never spills over into the major version number
in the way that minutes add up to hours or months add up to years.

It isn't hard to write a few simple comparisons for semantic version identifiers,
but getting all the different cases right is almost as tricky as handling dates and times correctly,
so we will rely on the [`semver`][node-semver] module.
`semver.valid('1.2.3')` checks that `1.2.3` is a valid version identifier,
while `semver.satisfies('2.2', '1.0 - 3.1')` checks that its first argument
is compatible with the range specified in its second.

## How can we find a consistent set of packages?

Imagine that each package we need is represented as an axis on a multi-dimensional grid,
with its versions as the tick marks
(<span f="package-manager-allowable"></span>).
Each point on the grid is a possible combination of package versions.
We can block out regions of this grid using the constraints on the package versions;
whatever points are left when we're done represent legal combinations.

{% include figure id='package-manager-allowable' img='figures/allowable.svg' alt='Allowable versions' cap='Finding allowable combinations of package versions.' %}

For example,
suppose we have the set of requirements shown in <span t="package-manager-example-dependencies"></span>.
There are 18 possible configurations
(2 for X × 3 for Y × 3 for Z)
but 16 are excluded by various incompatibilities.
Of the two remaining possibilities,
X/2 + Y/3 + Z/3 is strictly greater than X/2 + Y/2 + Z/2,
so we would probably choose the former
(<span t="package-manager-example-result"></span>).
if we wound up with A/1 + B/2 versus A/2 + B/1,
we would need to add rules for resolving ties.

<div class="callout" markdown="1">
### Reproducibility

No matter what kind of software you build,
a given set of inputs should always produce the same output;
if they don't,
testing is much more difficult (or impossible) <cite>Taschuk2017</cite>.
There may not be a strong reason to prefer one mutually-compatible set of packages over another,
but a package manager should still resolve the ambiguity the same way every time.
It may not be what everyone wants,
but at least they will be unhappy for the same reasons everywhere.
This is why [NPM][npm] has both `package.json` and a `package-lock.json` files:
the former is written by the user and specifies what they *want*,
while the latter is created by the package manager and specifies exactly what they *got*.
If you want to reproduce someone else's setup for debugging purposes,
you should install what is described in the latter file.
</div>

{% include table id='package-manager-example-dependencies' file='example-dependencies.tbl' cap='Example package dependencies.' %}

{% include table id='package-manager-example-result' file='example-result.tbl' cap='Result for example package dependencies.' %}

To construct <span t="package-manager-example-dependencies"></span>
we find the transitive closure of all packages plus all of their dependencies.
We then pick two packages and create a list of their valid pairs.
Choosing a third package,
we cross off pairs that can't be satisfied
to leave triples of legal combinations.
We repeat this until all packages are included in our table.

In the worst case this procedure will create
a <span g="combinatorial_explosion">combinatorial explosion</span> of possibilities.
Smart algorithms will try to add packages to the mix
in an order that minimize the number of new possibilities at each stage,
or create pairs and then combine them to create pairs of pairs and so on.
Our algorithm will be simpler (and therefore slower),
but illustrates the key idea.

## How can we implement constraint satisfaction?

To avoid messing around with parsers,
our programs reads a JSON data structure describing the problem;
a real package manager would read the <span g="manifest">manifests</span> of the packages in question
and construct a similar data structure.
We will stick to single-digit version numbers for readability,
and will use this as our first test case:

{% include file file='double-chained.json' %}

<div class="callout" markdown="1">

### Comments

If you ever design a data format,
please include a standard way for people to add comments,
because they will always want to.
YAML has this,
but JSON and CSV don't.

</div>

To check if a combination of specific versions of packages is compatible with a manifest,
we add each package to our active list in turn and look for violations.
If there aren't any more packages to add and we haven't found a violation,
then what we have must be a legal configuration.

{% include erase file='sweep.js' key='allows' %}

The simplest way to find configurations is to sweep over all possibilities.
For debugging purposes,
our function prints possibilities as it goes:

{% include keep file='sweep.js' key='allows' %}

If we run this program on the two-package example shown earlier we get this output:

{% include multi pat='sweep-double-chained.*' fill='sh out' %}

When we run it on our triple-package example we get this:

{% include multi pat='sweep-triple.*' fill='sh out' %}

This works,
but it is doing a lot of unnecessary work.
If we sort the output by the case that caught the exclusion
it turns out that 9 of the 17 exclusions are redundant rediscovery of a previously-known problem
<span t="package-manager-exclusions"></span>.

{% include table id='package-manager-exclusions' file='exclusions.tbl' cap='Package exclusions.' %}

## How can we do less work?

In order to make this more efficient we need to <span g="prune">prune</span> the search tree
as we go along
(<span f="package-manager-pruning"></span>).
After all,
if we know that X and Y are incompatible,
there is no need to check Z as well.

{% include figure id='package-manager-pruning' img='figures/pruning.svg' alt='Pruning the search tree' cap='Pruning options in the search tree to reduce work.' %}

This version of the program collects possible solutions and displays them at the end.
It only keeps checking a partial solution if what it has found so far looks good:

{% include erase file='prune.js' key='compatible' %}

The `compatible` function checks to see if adding something will leave us with a consistent configuration:

{% include keep file='prune.js' key='compatible' %}

Checking as we go gets us from 18 complete solutions to 11.
One is workable
and two are incomplete---they represent 6 possible complete solutions that we didn't need to finish:

{% include file file='prune-triple.out' %}

Another way to look at the work is the number of steps in the search.
The full search had 18×3 = 54 steps.
Pruning leaves us with (12×3) + (2×2) = 40 steps
so we have eliminated roughly 1/4 of the work.

What if we searched in the reverse order?

{% include file file='reverse.js' %}

{% include file file='reverse-triple.out' %}

Now we have (8×3) + (5×2) = 34 steps,
i.e.,
we have eliminated roughly 1/3 of the work.
That may not seem like a big difference,
but if we go five levels deep at the same rate
it cuts the work in half.
There are lots of <span g="heuristic">heuristics</span> for searching trees;
none are guaranteed to give better performance in every case,
but most give better performance in most cases.

<div class="callout" markdown="1">
### What research is for

SAT solvers are like regular expression libraries and random number generators:
it is the work of many lifetimes to create ones that are both fast and correct.
A lot of computer science researchers devote their careers to highly-specialized topics like this.
The debates often seem esoteric to outsiders,
and most ideas turn out to be dead ends,
but even small improvements in fundamental tools can have a profound impact.
</div>