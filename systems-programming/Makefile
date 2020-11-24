TARGETS=\
  copy-file-unfiltered.out \
  glob-all-files.out \
  glob-get-then-filter-pedantic.out \
  list-dir-function-defined.out \
  list-dir-wrong.out

include ../_rules.mk

copy-file-unfiltered.out: copy-file-unfiltered-wrap.sh copy-file-unfiltered.sh copy-file-unfiltered.js
	bash $< >& $@

list-dir-wrong.out: list-dir-wrong-wrapped.sh list-dir-wrong.sh list-dir-wrong.js
	bash $< >& $@
