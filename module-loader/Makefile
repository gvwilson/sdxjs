TARGETS=\
  automatic-namespacing.txt \
  js-command-line.txt \
  js-interactive.txt \
  py-command-line.txt \
  py-interactive.txt \
  manual-namespacing.txt \
  test-load-module-only.txt \
  test-need-large-module.txt \
  test-need-large-needless.txt \
  test-need-small-module.txt

include ../_rules.mk

js-command-line.txt: $(wildcard checking/*.js)
js-interactive.txt: $(wildcard checking/*.js)
py-command-line.txt: $(wildcard checking/*.py)
py-interactive.txt: $(wildcard checking/*.py)
test-need-large-module.txt: large-module.js small-module.js
