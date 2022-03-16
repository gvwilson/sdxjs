TARGETS=\
  add-timestamps.out \
  check-cycles.out \
  display-only.out \
  pattern-user-attempt.out \
  pattern-user-run.out \
  pattern-user-show.out \
  update-timestamps.out \
  variable-expander.out

include ../examples.mk

display-only.out: driver.js
update-timestamps.out: driver.js

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
