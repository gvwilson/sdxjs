TARGETS=\
  add-stamps.out \
  check-cycles.out \
  display-only.out \
  pattern-user-attempt.out \
  pattern-user-run.out \
  pattern-user-show.out \
  update-stamps.out \
  variable-expander.out

include ../examples.mk

display-only.out: driver.js
update-stamps.out: driver.js

pattern-user-run.js: pattern-user-show.js
pattern-user-show.js: pattern-user-read.js
pattern-user-read.js: variable-expander.js
pattern-user-attempt.js: variable-expander.js
variable-expander.js: update-stamps.js
update-stamps.js: add-stamps.js
add-stamps.js: graph-creator.js
display-only.js: graph-creator.js
graph-creator.js: config-loader.js
config-loader.js: skeleton-builder.js
