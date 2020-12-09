---
---

-   Storing data in tables inspired by the [tidyverse][tidyverse] and [DataForge][data-forge].
-   Outline

<%- include('/inc/file.html', {file: 'dataframe.js'}) %>

## What basic operations do we need?

-   Constructor

<%- include('/inc/file.html', {file: 'constructor.js'}) %>

-   Equality check

<%- include('/inc/file.html', {file: 'equal.js'}) %>

## How can we choose what data to work with?

-   Drop and select

<%- include('/inc/file.html', {file: 'dropselect.js'}) %>

-   Filter rows

<%- include('/inc/file.html', {file: 'filter.js'}) %>

## How can we create new values?

-   Mutate (add new columns)

<%- include('/inc/file.html', {file: 'mutate.js'}) %>

## How can we arrange values?

-   Sort

<%- include('/inc/file.html', {file: 'sort.js'}) %>

## How can we remove duplicates?

-   Find unique values

<%- include('/inc/file.html', {file: 'unique.js'}) %>

## How can we calculate summaries?

-   Grouping and ungrouping

<%- include('/inc/file.html', {file: 'group.js'}) %>

-   Make a group ID

<%- include('/inc/file.html', {file: 'makegroupid.js'}) %>

-   Summarization

<%- include('/inc/file.html', {file: 'summarize.js'}) %>

-   Standard summarization functions

<%- include('/inc/file.html', {file: 'summarizefuncs.js'}) %>

## How can we combine datasets?

-   Join with another dataframe

<%- include('/inc/file.html', {file: 'join.js'}) %>

-   Join helpers

<%- include('/inc/file.html', {file: 'joinhelpers.js'}) %>

## What's left over?

-   Utilities

<%- include('/inc/file.html', {file: 'utilities.js'}) %>
