TARGETS=\
  copy-file-unfiltered.txt \
  glob-all-files.txt \
  glob-get-then-filter-pedantic.txt \
  list-dir-function-defined.txt \
  list-dir-wrong.txt

include ../_rules.mk

copy-file-unfiltered.txt: copy-file-unfiltered-wrap.sh copy-file-unfiltered.sh copy-file-unfiltered.js
	bash $< >& $@

list-dir-wrong.txt: list-dir-wrong-wrapped.sh list-dir-wrong.sh list-dir-wrong.js
	bash $< >& $@
