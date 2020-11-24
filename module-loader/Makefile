TARGETS=\
  checking/js-command-line.out \
  checking/js-interactive.out \
  checking/py-command-line.out \
  checking/py-interactive.out \
  automatic-namespacing.out \
  manual-namespacing.out \
  test-load-module-only.out \
  test-need-large-module.out \
  test-need-large-needless.out \
  test-need-small-module.out

include ../_rules.mk

checking/js-command-line.out: $(wildcard checking/*.js)
	cd checking && make $(notdir $@)

checking/js-interactive.out: $(wildcard checking/*.js)
	cd checking && make $(notdir $@)

checking/py-command-line.out: $(wildcard checking/*.py)
	cd checking && make $(notdir $@)

checking/py-interactive.out: $(wildcard checking/*.py)
	cd checking && make $(notdir $@)

test-need-large-module.out: large-module.js small-module.js
