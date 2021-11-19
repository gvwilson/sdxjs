{% if include.problem %}

A join combines data from two tables based on matching keys.
For example,
if the two tables are:

<div class="latex" command="\vspace{\baselineskip}"/>

| Key | Left |
| --- | ---- |
| A   | a1   |
| B   | b1   |
| C   | c1   |

<div class="latex" command="\vspace{\baselineskip}"/>

{: .continue}
and:

<div class="latex" command="\vspace{\baselineskip}"/>

| Key | Right |
| --- | ----- |
| A   | a2    |
| A   | a3    |
| B   | b2    |

<div class="latex" command="\vspace{\baselineskip}"/>

{: .continue}
then the join is:

<div class="latex" command="\vspace{\baselineskip}"/>

| Key | Left | Right |
| --- | ---- | ----- |
| A   | a1   | a2    |
| A   | a1   | a3    |
| B   | b1   | b2    |

<div class="latex" command="\vspace{\baselineskip}"/>

Write a test to compare the performance of row-wise vs. column-wise storage
when joining two tables based on matching numeric keys.
Does the answer depend on the fraction of keys that match?

{% else %}

FIXME: write solution.

{% endif %}
