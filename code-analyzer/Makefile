TARGETS=\
  find-debugger-methods.raw.out \
  run-find-ancestors.out \
  run-find-methods.raw.out

include ../_rules.mk

find-debugger-methods.raw.out: run-find-methods.js
run-find-ancestors.out: run-find-ancestors.js
run-find-methods.raw.out: run-find-methods.js

run-find-ancestors.js: find-ancestors.js
	@touch $@

run-find-methods.js: find-methods.js
	@touch $@

find-methods.js: find-ancestors.js
	@touch $@
