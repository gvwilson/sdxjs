node driver.js ./pattern-user-attempt.js pattern-rules.yml add-timestamps.yml \
     2>&1 | ../_tools/wrap.js > pattern-user-attempt.out
exit 0
