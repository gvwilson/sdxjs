node driver.js ./pattern-user-attempt pattern-rules.yml add-timestamps.yml \
     2>&1 | ../_tools/wrap.js > pattern-user-attempt.txt
exit 0
