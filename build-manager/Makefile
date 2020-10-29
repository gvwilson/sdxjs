TARGETS=\
  add-timestamps.txt \
  display-only.txt \
  pattern-user-attempt.txt \
  pattern-user-run.txt \
  pattern-user-show.txt \
  update-on-timestamps.txt \
  variable-expander.txt

include ../_rules.mk

display-only.txt: driver.js
update-on-timestamps.txt: driver.js

pattern-user-run.js: pattern-user-show.js
pattern-user-show.js: pattern-user-read.js
pattern-user-read.js: variable-expander.js
pattern-user-attempt.js: variable-expander.js
variable-expander.js: update-on-timestamps.js
update-on-timestamps.js: add-timestamps.js
add-timestamps.js: graph-creator.js
display-only.js: graph-creator.js
graph-creator.js: config-loader.js
config-loader.js: skeleton-builder.js
