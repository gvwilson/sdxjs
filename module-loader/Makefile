TARGETS=\
  automatic-namespacing.out \
  js-command-line.out \
  js-interactive.out \
  py-command-line.out \
  py-interactive.out \
  manual-namespacing.out \
  test-load-module-only.out \
  test-need-large-module.out \
  test-need-large-needless.out \
  test-need-small-module.out

include ../_rules.mk

js-command-line.out: $(wildcard checking/*.js)
js-interactive.out: $(wildcard checking/*.js)
py-command-line.out: $(wildcard checking/*.py)
py-interactive.out: $(wildcard checking/*.py)
test-need-large-module.out: large-module.js small-module.js
