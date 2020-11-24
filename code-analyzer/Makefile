TARGETS=\
  find-debugger-methods.out \
  run-find-ancestors.out \
  run-find-methods.out

include ../_rules.mk

find-debugger-methods.out: run-find-methods.js
run-find-ancestors.out: run-find-ancestors.js
run-find-methods.out: run-find-methods.js

run-find-ancestors.js: find-ancestors.js
	@touch $@

run-find-methods.js: find-methods.js
	@touch $@

find-methods.js: find-ancestors.js
	@touch $@
