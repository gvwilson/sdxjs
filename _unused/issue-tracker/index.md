---
---

-   Every project should have a to-do list
    -   A text file with one line per item
    -   Oh, and the first token is the priority
    -   And if we have `@name` at the start it's assigned to a person
    -   Hm… if we want cross-references we need to number them
    -   So we need a way to find the next serial number
    -   And an `active` flag to show which ones we should currently show
    -   As a matter of fact, let's make that a `state` field
    -   And there should definitely be tags
-   Databases were invented to handle <g key="crud">CRUD</g> applications like this
-   We can work our way up to databases by storing everything as <g key="json">JSON</g> and writing query functions

## How can we design a 

-   Co-design two things:
    -   Operations
    -   Data <g key="schema">schema</a>
-   Data design
    -   `user(user_id, email)`
    -   `priority(priority_id, name)`
    -   `state(state_id, name)`
    -   `issue(issue_id, state_id, user_id|null, description)`
    -   `*issue_tag(issue_id, tag)`
-   Operation design
    -   