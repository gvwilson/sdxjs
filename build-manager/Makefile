TARGETS=\
  add-timestamps.txt \
  check-cycles.txt \
  display-only.txt \
  pattern-user-attempt.txt \
  pattern-user-run.txt \
  pattern-user-show.txt \
  update-timestamps.txt \
  variable-expander.txt

include ../_rules.mk

display-only.txt: driver.js
update-timestamps.txt: driver.js

pattern-user-run.js: pattern-user-show.js
pattern-user-show.js: pattern-user-read.js
pattern-user-read.js: variable-expander.js
pattern-user-attempt.js: variable-expander.js
variable-expander.js: update-timestamps.js
update-timestamps.js: add-timestamps.js
add-timestamps.js: graph-creator.js
display-only.js: graph-creator.js
graph-creator.js: config-loader.js
config-loader.js: skeleton-builder.js
