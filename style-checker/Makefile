TARGETS=\
  check-name-lengths.txt \
  generator-count.txt \
  generator-example.txt \
  generator-tree-for.txt \
  generator-tree-while.txt \
  parse-single-const.txt \
  parse-const-func-and-call.txt \
  walk-ast.txt \
  walker-class.txt

include ../rules.mk

parse-const-func-and-call.txt: parse-const-func-and-call.sh parse-const-func-and-call.js
	bash $<
