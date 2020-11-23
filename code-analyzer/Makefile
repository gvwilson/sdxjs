TARGETS=\
  find-debugger-methods.txt \
  run-find-ancestors.txt \
  run-find-methods.txt

include ../_rules.mk

find-debugger-methods.txt: run-find-methods.js
run-find-ancestors.txt: run-find-ancestors.js
run-find-methods.txt: run-find-methods.js

run-find-ancestors.js: find-ancestors.js
	@touch $@

run-find-methods.js: find-methods.js
	@touch $@
