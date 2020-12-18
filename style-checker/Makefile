TARGETS=\
  check-name-lengths.out \
  find-debugger-methods.raw.out \
  run-find-ancestors.out \
  run-find-methods.raw.out \
  generator-count.out \
  generator-example.out \
  generator-tree-for.out \
  generator-tree-while.out \
  parse-single-const.out \
  parse-single-const.slice.out \
  parse-const-func.slice.out \
  walk-ast.out \
  walker-class.out

include ../examples.mk

find-debugger-methods.raw.out: run-find-methods.js
run-find-ancestors.out: run-find-ancestors.js
run-find-methods.raw.out: run-find-methods.js

run-find-ancestors.js: find-ancestors.js
	@touch $@

run-find-methods.js: find-methods.js
	@touch $@

find-methods.js: find-ancestors.js
	@touch $@
