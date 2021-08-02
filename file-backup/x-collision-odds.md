{% if include.problem %}

If hashes were only 2 bits long,
then the chances of collision with each successive file
assuming no previous collision are:

| Number of Files | Odds of Collision |
| --------------- | ----------------- |
| 1               | 0%                |
| 2               | 25%               |
| 3               | 50%               |
| 4               | 75%               |
| 5               | 100%              |

A colleague of yours says this means that if we hash four files,
there's only a 75% chance of any collision occurring.
What are the actual odds?

{% else %}

FIXME: write solution.

{% endif %}
