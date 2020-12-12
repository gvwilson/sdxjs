Modify the rule lookup mechanism so that if two conflicting rules are defined,
the one that is defined second takes precedence.
For example,
if there are two definitions for `row.bold`,
whichever comes last in the JSON representation of the CSS wins.
